// Runs the actual route code against an in-memory database. Never calls a live service.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
process.env.LEADS_AUTH_SECRET = crypto.randomBytes(32).toString('hex');
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
const member = { id: 'test-member', full_name: 'Test Member', email: 'test_member@example.invalid', plan: 'annual', created_at: '2026-01-01' };
const other = { ...member, id: 'other-member', email: 'other@example.invalid' };
const tables = {
  fw_memberships: [member, other], fw_member_auth: [],
  fw_member_profiles: [{ member_email: other.email, what_building: 'Example', who_its_for: 'Founders', problem: 'Test' }],
  fw_weekly_goals: [{ id: 'goal-1', member_email: other.email, member_name: other.full_name, goal: 'Test goal', status: 'in_progress' }],
  fw_wings_ledger: [],
};
let calls = [], databaseFailure = false;
const db = { from(table) {
  const q = { op: 'read', filters: [], single: false };
  const matches = row => q.filters.every(([type, col, val]) => {
    if (type === 'eq') return row[col] === val;
    // A literal expected identity is enough for this test; captured filters verify escaping.
    if (type === 'ilike') return String(row[col]).toLowerCase() === val.replace(/\\([_%\\])/g, '$1').toLowerCase();
    return true;
  });
  const proxy = new Proxy(q, { get(o, key) {
    if (key === 'then') return (resolve, reject) => {
      calls.push({ table, op: q.op, filters: q.filters });
      if (databaseFailure) return Promise.resolve({ data: null, error: new Error('Test database outage') }).then(resolve, reject);
      let rows = tables[table] || [];
      let result = rows.filter(matches);
      if (q.op === 'upsert') {
        const row = rows.find(r => r.email === q.value.email);
        if (row) Object.assign(row, q.value); else rows.push({ ...q.value });
        result = rows.filter(r => r.email === q.value.email);
      }
      if (q.op === 'update') { result.forEach(r => Object.assign(r, q.value)); }
      if (q.op === 'insert') { rows.push({ ...q.value }); result = [{ ...q.value }]; }
      tables[table] = rows;
      return Promise.resolve({ data: q.single ? result[0] || null : result, error: null }).then(resolve, reject);
    };
    return (...args) => {
      if (['insert', 'delete', 'update', 'upsert'].includes(key)) { q.op = key; q.value = args[0]; }
      if (['eq', 'ilike', 'gte'].includes(key)) q.filters.push([key, ...args]);
      if (['single', 'maybeSingle'].includes(key)) q.single = true;
      return proxy;
    };
  }});
  return proxy;
}};
const cache = {};
function load(file) {
  file = path.resolve(root, file);
  if (cache[file]) return cache[file].exports;
  const module = { exports: {} }; cache[file] = module;
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const localRequire = name => {
    if (name === '@supabase/supabase-js') return { createClient: () => db };
    if (name.startsWith('@/') || name.startsWith('.')) {
      let resolved = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      return load(resolved.endsWith('.ts') ? resolved : resolved + '.ts');
    }
    return require(name);
  };
  vm.runInThisContext('(function(require,module,exports){' + source + '\n})', { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
let nextIp = 1;
const request = (method, body, cookie) => new NextRequest('https://test.invalid/api', {
  method, headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `192.0.2.${nextIp++}`, ...(cookie ? { cookie } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return data + '.' + crypto.createHmac('sha256', process.env.LEADS_AUTH_SECRET).update(data).digest('base64url');
}
(async () => {
  let passed = 0;
  const check = async (name, fn) => { await fn(); console.log('PASS', name); passed++; };
  const session = load('app/api/members/session/route.ts');
  const admin = load('app/api/admin/member-auth/route.ts');
  const credentials = load('lib/member-credentials.ts');
  const leads = load('app/api/leads/verify/route.ts');
  const adminCookie = 'fw_leads_token=' + sign({ typ: 'leads', role: 'admin', email: 'admin@example.invalid', exp: Date.now() + 60000 });
  let setupToken, memberToken;
  await check('Knowing an email cannot create a password', async () => {
    const r = await session.POST(request('POST', { email: member.email, password: 'a-long-test-password', mode: 'setup' }));
    assert.equal(r.status, 401); assert.equal(tables.fw_member_auth.length, 0);
  });
  await check('Email probe does not reveal membership or setup state', async () => {
    for (const email of [member.email, 'missing@example.invalid']) {
      const r = await session.POST(request('POST', { email })); assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { needsPassword: true });
    }
  });
  await check('Only admins can issue invitations', async () => {
    assert.equal((await admin.POST(request('POST', { email: member.email }))).status, 401);
    const team = 'fw_leads_token=' + sign({ typ: 'leads', role: 'team', email: 'team@example.invalid', exp: Date.now() + 60000 });
    assert.equal((await admin.POST(request('POST', { email: member.email }, team))).status, 401);
    const r = await admin.POST(request('POST', { email: member.email }, adminCookie));
    assert.equal(r.status, 200); setupToken = (await r.json()).setupToken;
    assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.ok(!tables.fw_member_auth[0].password_hash.includes(setupToken));
  });
  await check('Wrong and expired invitations are rejected', async () => {
    const r = await session.POST(request('POST', { email: member.email, password: 'a-long-test-password', mode: 'setup', setupToken: 'wrong' }));
    assert.equal(r.status, 401);
    const hash = await credentials.hashPassword(setupToken);
    assert.equal(await credentials.verifyInvitation(setupToken, `invite:${Date.now() - 1}:${hash}`), false);
  });
  await check('A valid invitation is single-use under concurrent redemption', async () => {
    const body = { email: member.email, password: 'a-long-test-password', mode: 'setup', setupToken };
    const responses = await Promise.all([session.POST(request('POST', body)), session.POST(request('POST', body))]);
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 401]);
    memberToken = responses.find(r => r.status === 200).cookies.get('fw_member_token').value;
    assert.ok(await session.verifyMemberToken(memberToken));
    assert.equal((await session.POST(request('POST', body))).status, 401);
  });
  await check('Existing scrypt password format still logs in', async () => {
    const r = await session.POST(request('POST', { email: member.email, password: 'a-long-test-password' }));
    assert.equal(r.status, 200);
  });
  await check('Member endpoints hide other members email addresses', async () => {
    for (const route of ['wings', 'goals']) {
      const r = await load(`app/api/members/${route}/route.ts`).GET(request('GET', null, 'fw_member_token=' + memberToken));
      assert.equal(r.status, 200); const body = await r.text();
      assert.equal(body.includes(other.email), false);
    }
  });
  await check('Wings uses member IDs and rejects self-gifts and old email requests', async () => {
    const route = load('app/api/members/wings/route.ts');
    const cookie = 'fw_member_token=' + memberToken;
    assert.equal((await route.POST(request('POST', { to_member_id: other.id, amount: 10 }, cookie))).status, 200);
    assert.equal(tables.fw_wings_ledger[0].to_email, other.email);
    assert.equal((await route.POST(request('POST', { to_member_id: member.id, amount: 10 }, cookie))).status, 400);
    assert.equal((await route.POST(request('POST', { to_email: other.email, amount: 10 }, cookie))).status, 400);
  });
  await check('Profile ownership lookup escapes wildcard characters', async () => {
    calls = [];
    await load('app/api/members/profile/route.ts').GET(request('GET', null, 'fw_member_token=' + memberToken));
    assert.ok(calls.some(c => c.table === 'fw_member_profiles' && c.filters.some(f => f[0] === 'ilike' && f[2] === 'test\\_member@example.invalid')));
  });
  await check('Malformed, expired, tampered and cross-role tokens are rejected', async () => {
    const payload = JSON.parse(Buffer.from(memberToken.split('.')[0], 'base64url'));
    assert.equal(await session.verifyMemberToken(sign({ ...payload, exp: undefined })), null);
    assert.equal(await session.verifyMemberToken(sign({ ...payload, exp: Date.now() - 1 })), null);
    assert.equal(await session.verifyMemberToken(memberToken + '.extra'), null);
    assert.equal(await session.verifyMemberToken(memberToken.slice(0, -3) + 'xxx'), null);
    assert.equal(leads.verifyToken(memberToken), null);
    assert.equal(leads.verifyToken(sign({ typ: 'leads', role: 'unknown', email: member.email, exp: Date.now() + 60000 })), null);
  });
  await check('Database outages fail closed', async () => {
    databaseFailure = true; assert.equal(await session.verifyMemberToken(memberToken), null); databaseFailure = false;
  });
  await check('Removing membership immediately blocks a previously valid token', async () => {
    tables.fw_memberships = [other]; assert.equal(await session.verifyMemberToken(memberToken), null); tables.fw_memberships = [member, other];
  });
  await check('Reset revokes existing member sessions before a new password is chosen', async () => {
    assert.equal((await admin.POST(request('POST', { email: member.email }, adminCookie))).status, 200);
    assert.equal(await session.verifyMemberToken(memberToken), null);
    const r = await load('app/api/members/directory/route.ts').GET(request('GET', null, 'fw_member_token=' + memberToken));
    assert.equal(r.status, 401);
  });
  await check('Admin logout expires its HttpOnly cookie on the server', async () => {
    const r = await load('app/api/leads/auth/route.ts').DELETE();
    const cookie = r.headers.get('set-cookie');
    assert.match(cookie, /fw_leads_token=;/); assert.match(cookie, /Max-Age=0/i); assert.match(cookie, /HttpOnly/i);
  });
  console.log(`${passed} security regression tests passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
