import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import ts from 'typescript';
import bcrypt from 'bcryptjs';
const nativeRequire = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(file, mocks = {}) {
  let filename = path.join(root, file);
  if (!fs.existsSync(filename) && fs.existsSync(filename + 'x')) filename += 'x';
  const m = new Module(filename); m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
  m.require = name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts', mocks);
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), name)) + '.ts', mocks);
    return nativeRequire(name);
  };
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  return m.exports;
}
async function main() {
  const { passwordError, passwordVersion } = load('src/lib/account/password.ts');
  assert.ok(passwordError('x'.repeat(11)));
  assert.ok(passwordError(' '.repeat(15)));
  assert.ok(passwordError('é'.repeat(37)));
  assert.equal(passwordError('é'.repeat(36)), null);
  const current = randomBytes(18).toString('hex'), replacement = randomBytes(18).toString('hex');
  let session = null;
  const actor = { id: 'staff', role: 'STAFF', name: 'Synthetic Staff', email: 'synthetic@example.invalid', password: await bcrypt.hash(current, 4), title: null, unit: null };
  const target = { ...actor, id: 'target', password: await bcrypt.hash(current, 4) };
  let conflict = false, writes = 0;
  const db = { user: {
    findUnique: async ({ where }) => where.id === 'staff' ? actor : where.id === 'target' ? target : null,
    updateMany: async ({ where, data }) => { if (conflict) return { count: 0 }; const u = where.id === 'staff' ? actor : target; assert.equal(where.password, u.password); u.password = data.password; writes++; return { count: 1 }; },
  } };
  const mocks = { '@/lib/auth': { auth: async () => session }, '@/lib/prisma': { prisma: db } };
  const { updatePassword } = load('src/lib/account/update-password.ts', mocks);
  const request = body => new Request('https://example.invalid', { method: 'POST', body: JSON.stringify(body) });
  const body = { currentPassword: current, newPassword: replacement, confirmPassword: replacement };
  assert.equal((await updatePassword(request(body))).status, 401);
  assert.equal((await updatePassword(new Request('https://example.invalid', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' }, body: JSON.stringify(body) }))).status, 403);
  session = { user: { id: 'staff', role: 'STAFF' } };
  assert.equal((await updatePassword(request(body), 'target')).status, 403);
  assert.equal((await updatePassword(request({ ...body, newPassword: 'short' }))).status, 400);
  assert.equal((await updatePassword(request({ ...body, confirmPassword: current }))).status, 400);
  assert.equal((await updatePassword(request({ ...body, currentPassword: replacement }))).status, 400);
  assert.equal((await updatePassword(request({ ...body, newPassword: current, confirmPassword: current }))).status, 400);
  assert.equal(writes, 0);
  const priorHash = actor.password;
  const success = await updatePassword(request({ ...body, role: 'ADMIN', id: 'target' }));
  assert.equal(success.status, 200); assert.equal((await success.json()).signInAgain, true);
  assert.ok(await bcrypt.compare(replacement, actor.password));
  assert.ok(!await bcrypt.compare(current, actor.password));
  assert.notEqual(passwordVersion(priorHash), passwordVersion(actor.password));
  assert.equal(actor.role, 'STAFF');
  session.user.role = actor.role = 'ADMIN';
  const adminBody = { ...body, currentPassword: replacement };
  const reset = await updatePassword(request(adminBody), 'target');
  assert.equal(reset.status, 200); assert.equal((await reset.json()).signInAgain, false);
  assert.ok(await bcrypt.compare(replacement, target.password));
  conflict = true;
  assert.equal((await updatePassword(request({ currentPassword: replacement, newPassword: current, confirmPassword: current }))).status, 409);

  let config;
  const nextAuth = value => { config = value; return {}; };
  load('src/lib/auth.ts', { 'next-auth': nextAuth, 'next-auth/providers/credentials': options => options, '@/lib/prisma': { prisma: db } });
  const jwt = config.callbacks.jwt;
  const token = { id: actor.id, passwordVersion: passwordVersion(actor.password) };
  assert.equal((await jwt({ token: { ...token }, user: undefined })).role, 'ADMIN');
  assert.equal(await jwt({ token: { id: actor.id }, user: undefined }), null, 'legacy sessions require fresh sign-in');
  assert.equal(await jwt({ token: { id: actor.id, passwordVersion: passwordVersion(priorHash) }, user: undefined }), null, 'old password sessions revoked');
  const clientSession = config.callbacks.session({ session: { user: {} }, token });
  assert.equal(clientSession.user.passwordVersion, undefined);
  assert.equal(clientSession.user.password, undefined);

  const { POST: create } = load('src/app/api/users/route.ts', mocks);
  session = null; assert.equal((await create(request({}))).status, 401);
  session = { user: { id: 'staff', role: 'STAFF' } }; assert.equal((await create(request({}))).status, 403);
  session.user.role = 'SUPERVISOR';
  assert.equal((await create(request({ name: 'Synthetic', email: 'synthetic@example.invalid', password: current, role: 'ADMIN' }))).status, 403);
  assert.equal((await create(request({ name: 'Synthetic', email: 'synthetic@example.invalid', password: current, role: 'invalid' }))).status, 400);
  const { createElement } = nativeRequire('react');
  const { renderToStaticMarkup } = nativeRequire('react-dom/server');
  const { default: Form } = load('src/components/PasswordForm.tsx', { 'next-auth/react': { signOut: async () => {} } });
  const formHtml = renderToStaticMarkup(createElement(Form));
  assert.equal((formHtml.match(/type="password"/g) ?? []).length, 3);
  assert.ok(formHtml.toLowerCase().includes('autocomplete="current-password"'));
  assert.ok(formHtml.toLowerCase().includes('autocomplete="new-password"'));
  assert.ok(formHtml.includes('minLength="12"') || formHtml.includes('minlength="12"'));
  assert.ok(!formHtml.includes(current) && !formHtml.includes(replacement));
  const resetHtml = renderToStaticMarkup(createElement(Form, { userId: 'target', userName: 'Synthetic Target' }));
  assert.ok(resetHtml.includes('Your administrator password'));
  assert.ok(resetHtml.includes('Synthetic Target'));
  const { default: Account } = load('src/app/dashboard/account/page.tsx', {
    '@/lib/auth': { auth: async () => ({ user: { ...actor, password: undefined } }) },
    'next-auth/react': { signOut: async () => {} },
  });
  const accountHtml = renderToStaticMarkup(await Account());
  assert.ok(accountHtml.includes('Account &amp; security'));
  assert.ok(!accountHtml.includes(actor.password));
  console.log('PASS: account page and password form labels, autocomplete, confirmation fields and no credential values in rendered output');
  console.log('PASS: password policy, reauthentication, own-account scope, admin-only reset, hashing, race protection, session revocation and user-creation authorization');
}
main().catch(err => { console.error(err); process.exitCode = 1; });
