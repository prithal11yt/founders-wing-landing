// Serves thesoloentrepreneur.in on the Hostinger VPS the way Vercel did: static
// files with clean URLs, the redirects and headers from vercel.json, and the
// api/*.js functions with Vercel's req/res helpers. nginx sits in front for TLS.
//
//   SITE_DIR=/var/www/tse-site PORT=3200 node tse-server.mjs

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SITE_DIR = path.resolve(process.env.SITE_DIR || '/var/www/tse-site')
const PORT = Number(process.env.PORT || 3200)
const vercel = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'vercel.json'), 'utf8'))

// Never served: source control, secrets, function sources and deploy config.
const BLOCKED = /^\/(\.|api\/|tests\/|security\/|scripts\/|node_modules\/|vercel\.json$|package(-lock)?\.json$)/

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.zip': 'application/zip',
  '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8',
}

// vercel.json sources use :param segments and (a|b) groups.
const toRegex = (source) => new RegExp('^' + source
  .replace(/\/:([a-zA-Z]+)\(([^)]+)\)/g, '/(?<$1>$2)')
  .replace(/\/:([a-zA-Z]+)/g, '/(?<$1>[^/]+)')
  .replace(/\/\(\.\*\)/g, '/(.*)') + '$')
const REDIRECTS = (vercel.redirects || []).map((r) => ({ re: toRegex(r.source), dest: r.destination, code: r.permanent ? 308 : 307 }))
const HEADERS = (vercel.headers || []).map((h) => ({ re: toRegex(h.source), headers: h.headers }))

const functions = new Map()
async function loadFunction(name) {
  if (!functions.has(name)) {
    const file = path.join(SITE_DIR, 'api', `${name}.js`)
    if (!fs.existsSync(file)) return null
    functions.set(name, await import(pathToFileURL(file).href))
  }
  return functions.get(name)
}

const sizeLimit = (mod) => {
  const raw = mod.config?.api?.bodyParser?.sizeLimit || '1mb'
  const m = /^(\d+)(kb|mb)$/i.exec(raw)
  return m ? Number(m[1]) * (m[2].toLowerCase() === 'kb' ? 1024 : 1024 * 1024) : 1024 * 1024
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size <= limit) chunks.push(c)
    })
    req.on('end', () => size > limit
      ? reject(Object.assign(new Error('Body too large'), { status: 413 }))
      : resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Vercel's helpers on top of Node's response object.
function vercelResponse(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(data))
    return res
  }
  res.send = (data) => {
    if (data === undefined || data === null) return res.end()
    if (Buffer.isBuffer(data) || typeof data === 'string') return res.end(data)
    return res.json(data)
  }
  res.redirect = (a, b) => {
    const [code, url] = typeof a === 'number' ? [a, b] : [307, a]
    res.statusCode = code
    res.setHeader('Location', url)
    return res.end()
  }
  return res
}

async function runFunction(name, req, res, url) {
  const mod = await loadFunction(name)
  if (!mod?.default) return false
  req.query = Object.fromEntries(url.searchParams)
  if (mod.config?.api?.bodyParser !== false && !['GET', 'HEAD'].includes(req.method)) {
    const raw = await readBody(req, sizeLimit(mod))
    const type = req.headers['content-type'] || ''
    if (type.includes('application/json')) {
      try { req.body = raw.length ? JSON.parse(raw.toString()) : {} } catch { req.body = raw.toString() }
    } else if (type.includes('application/x-www-form-urlencoded')) {
      req.body = Object.fromEntries(new URLSearchParams(raw.toString()))
    } else {
      req.body = raw.toString()
    }
  }
  await mod.default(req, vercelResponse(res))
  return true
}

function resolveFile(pathname) {
  const rel = decodeURIComponent(pathname)
  if (rel.includes('\0') || BLOCKED.test(rel)) return null
  const candidates = rel === '/' ? ['index.html'] : [`${rel}.html`, rel, `${rel}/index.html`]
  for (const c of candidates) {
    const file = path.join(SITE_DIR, c)
    if (!file.startsWith(SITE_DIR + path.sep)) return null
    try { if (fs.statSync(file).isFile()) return file } catch {}
  }
  return null
}

function sendFile(res, file, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream')
  if (!file.endsWith('.html')) res.setHeader('Cache-Control', 'public, max-age=3600')
  fs.createReadStream(file).pipe(res)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    let { pathname } = url

    for (const h of HEADERS) if (h.re.test(pathname)) for (const { key, value } of h.headers) res.setHeader(key, value)

    for (const r of REDIRECTS) {
      const m = r.re.exec(pathname)
      if (m) return res.writeHead(r.code, { Location: r.dest.replace(/:([a-zA-Z]+)/g, (_, k) => m.groups?.[k] ?? '') + url.search }).end()
    }

    const fn = /^\/api\/([a-z0-9-]+)$/i.exec(pathname)
    if (fn) {
      if (await runFunction(fn[1], req, res, url)) return
      return res.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"Not found"}')
    }

    // cleanUrls + trailingSlash:false, as on Vercel.
    if (pathname.length > 1 && pathname.endsWith('/')) return res.writeHead(308, { Location: pathname.replace(/\/+$/, '') + url.search }).end()
    if (pathname.endsWith('.html')) {
      const clean = pathname.slice(0, -5).replace(/\/index$/, '') || '/'
      return res.writeHead(308, { Location: clean + url.search }).end()
    }
    if (!['GET', 'HEAD'].includes(req.method)) return res.writeHead(405).end()

    const file = resolveFile(pathname)
    if (file) return sendFile(res, file)
    const notFound = path.join(SITE_DIR, '404.html')
    return fs.existsSync(notFound) ? sendFile(res, notFound, 404) : res.writeHead(404).end('Not found')
  } catch (err) {
    console.error('[tse-server]', req.method, req.url, err)
    if (!res.headersSent) res.writeHead(err.status || 500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.status === 413 ? 'Request too large' : 'Server error' }))
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`[tse-server] ${SITE_DIR} on 127.0.0.1:${PORT}`))
