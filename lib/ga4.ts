import crypto from 'crypto'

/* Minimal Google Analytics 4 Data API client using a service account.
   No SDK: the JWT is signed with Node's crypto and exchanged for an access token.

   Env: GA_SERVICE_ACCOUNT_JSON — the service-account key file contents (raw JSON,
   or base64 of it). The service account must be a Viewer on the GA4 property. */

export const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID || '529375537' // Founders Wing

type Creds = { client_email: string; private_key: string; token_uri?: string }

export function gaConfigured(): boolean {
  return Boolean(process.env.GA_SERVICE_ACCOUNT_JSON)
}

function readCreds(): Creds {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GA_SERVICE_ACCOUNT_JSON is not set')
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  const json = JSON.parse(text) as Creds
  if (!json.client_email || !json.private_key) throw new Error('GA_SERVICE_ACCOUNT_JSON is missing client_email/private_key')
  return json
}

let cachedToken: { token: string; exp: number } | null = null

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token
  const creds = readCreds()
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(
    JSON.stringify({
      iss: creds.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: creds.token_uri || 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url')
  const unsigned = `${header}.${claims}`
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), creds.private_key).toString('base64url')
  const res = await fetch(creds.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  })
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 }
  return cachedToken.token
}

export type DateRange = { startDate: string; endDate: string }
export type Filter =
  | { fieldName: string; stringFilter: { matchType?: 'EXACT' | 'BEGINS_WITH' | 'CONTAINS'; value: string } }

export type ReportRequest = {
  dimensions?: string[]
  metrics: string[]
  dateRanges: DateRange[]
  limit?: number
  orderBy?: { metric?: string; dimension?: string; desc?: boolean }
  filter?: Filter
}

export type Row = { dims: Record<string, string>; mets: Record<string, number>; range: number }

function toBody(r: ReportRequest) {
  return {
    dimensions: (r.dimensions ?? []).map(name => ({ name })),
    metrics: r.metrics.map(name => ({ name })),
    dateRanges: r.dateRanges,
    limit: r.limit ?? 50,
    keepEmptyRows: false,
    ...(r.orderBy
      ? {
          orderBys: [
            r.orderBy.metric
              ? { metric: { metricName: r.orderBy.metric }, desc: r.orderBy.desc ?? true }
              : { dimension: { dimensionName: r.orderBy.dimension! }, desc: r.orderBy.desc ?? false },
          ],
        }
      : {}),
    ...(r.filter ? { dimensionFilter: { filter: r.filter } } : {}),
  }
}

type ApiReport = {
  dimensionHeaders?: { name: string }[]
  metricHeaders?: { name: string }[]
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]
}

function parse(rep: ApiReport): Row[] {
  const dh = (rep.dimensionHeaders ?? []).map(h => h.name)
  const mh = (rep.metricHeaders ?? []).map(h => h.name)
  return (rep.rows ?? []).map(row => {
    const dims: Record<string, string> = {}
    let range = 0
    ;(row.dimensionValues ?? []).forEach((v, i) => {
      if (dh[i] === 'dateRange') range = Number(v.value.replace('date_range_', '')) || 0
      else dims[dh[i]] = v.value
    })
    const mets: Record<string, number> = {}
    ;(row.metricValues ?? []).forEach((v, i) => {
      mets[mh[i]] = Number(v.value)
    })
    return { dims, mets, range }
  })
}

/** Runs many reports in batches of five (the API's limit per batch call). */
export async function runReports(requests: ReportRequest[], propertyId = GA_PROPERTY_ID): Promise<Row[][]> {
  const token = await accessToken()
  const out: Row[][] = []
  for (let i = 0; i < requests.length; i += 5) {
    const chunk = requests.slice(i, i + 5)
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: chunk.map(toBody) }),
    })
    if (!res.ok) throw new Error(`GA4 batchRunReports failed: ${res.status} ${(await res.text()).slice(0, 400)}`)
    const data = (await res.json()) as { reports?: ApiReport[] }
    for (const rep of data.reports ?? []) out.push(parse(rep))
  }
  return out
}
