/**
 * Phase 1 — Automated Test Runner
 *
 * Usage:
 *   node test-phase1.js                          # public + 401 tests only
 *   TEST_TOKEN=eyJ... node test-phase1.js        # + full CRUD + validation
 *
 * Requires: server running on localhost:5000
 */

require('dotenv').config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api/v1`;
const TEST_TOKEN = process.env.TEST_TOKEN || null;
const FAKE_UUID = '00000000-0000-0000-0000-000000000000';

// ─── Terminal colours ─────────────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ─── Test state ───────────────────────────────────────────────────────────────
const results = { pass: 0, fail: 0, skip: 0, warn: 0 };
const failures = [];
let currentSuite = '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function suite(name) {
  currentSuite = name;
  console.log(`\n${c.bold(c.cyan(`▶ ${name}`))}`);
}

function pass(name) {
  results.pass++;
  console.log(`  ${c.green('✓')} ${c.dim(name)}`);
}

function fail(name, detail) {
  results.fail++;
  const msg = `${currentSuite} › ${name}`;
  failures.push({ msg, detail });
  console.log(`  ${c.red('✗')} ${c.red(name)}`);
  if (detail) { console.log(`    ${c.dim(detail)}`); }
}

function skip(name, reason) {
  results.skip++;
  console.log(`  ${c.yellow('○')} ${c.dim(name)} ${c.dim(`(${reason})`)}`);
}

function warn(name, detail) {
  results.warn++;
  console.log(`  ${c.yellow('⚠')} ${c.yellow(name)}`);
  if (detail) { console.log(`    ${c.dim(detail)}`); }
}

async function req(method, path, { body, token, formData } = {}) {
  const headers = {};
  if (token) { headers['Authorization'] = `Bearer ${token}`; }

  let bodyPayload = undefined;
  if (body) {
    headers['Content-Type'] = 'application/json';
    bodyPayload = JSON.stringify(body);
  }
  if (formData) {
    bodyPayload = formData;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: bodyPayload,
  });

  const rawText = await res.text().catch(() => '');
  let json = null;
  try { json = JSON.parse(rawText); } catch { /* non-JSON response */ }
  return { status: res.status, json, rawText };
}

// ─── Assertions ───────────────────────────────────────────────────────────────

function assertShape(testName, json, rawText) {
  if (!json || typeof json.success !== 'boolean' || !('data' in json) || !('error' in json)) {
    const preview = rawText ? rawText.slice(0, 120).replace(/\n/g, ' ') : '(empty)';
    fail(testName, `Response missing {success,data,error} shape. Body: ${preview}`);
    return false;
  }
  return true;
}

function assertStatus(testName, actual, expected) {
  if (actual !== expected) {
    fail(testName, `Expected HTTP ${expected}, got ${actual}`);
    return false;
  }
  return true;
}

function assertSuccess(testName, { status, json, rawText }, expectedStatus = 200) {
  if (!assertStatus(testName, status, expectedStatus)) { return false; }
  if (!assertShape(testName, json, rawText)) { return false; }
  if (json.success !== true) {
    fail(testName, `Expected success:true, got: ${JSON.stringify(json.error)}`);
    return false;
  }
  pass(testName);
  return true;
}

function assertError(testName, { status, json, rawText }, expectedStatus, expectedCode) {
  if (!assertStatus(testName, status, expectedStatus)) { return false; }
  if (!assertShape(testName, json, rawText)) { return false; }
  if (json.success !== false) {
    fail(testName, `Expected success:false`);
    return false;
  }
  if (expectedCode && json.error?.code !== expectedCode) {
    fail(testName, `Expected error.code "${expectedCode}", got "${json.error?.code}"`);
    return false;
  }
  pass(testName);
  return true;
}

// ─── Shared CRUD state (populated during auth-gated tests) ────────────────────
const state = {
  skillId1: null,
  skillId2: null,
  projectId: null,
  experienceId: null,
  socialAccountId: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Infrastructure
// ─────────────────────────────────────────────────────────────────────────────
async function testInfrastructure() {
  suite('Infrastructure');

  const r = await req('GET', '/health');
  if (assertSuccess('GET /health → 200', r)) {
    if (r.json.data?.status === 'ok') { pass('health data.status is "ok"'); }
    else { fail('health data.status is "ok"', `Got: ${r.json.data?.status}`); }
    if (typeof r.json.data?.timestamp === 'string') { pass('health data.timestamp is string'); }
    else { fail('health data.timestamp is string'); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Response format consistency
// ─────────────────────────────────────────────────────────────────────────────
async function testResponseFormat() {
  suite('Response Format Consistency');

  const paths = [
    '/health',
    '/unknown-user-xyz/projects',
    '/unknown-user-xyz/experience',
    '/unknown-user-xyz/skills',
    '/unknown-user-xyz/contact',
    '/unknown-user-xyz/resume',
  ];

  for (const path of paths) {
    const r = await req('GET', path);
    if (r.json && typeof r.json.success === 'boolean' && 'data' in r.json && 'error' in r.json) {
      pass(`GET ${path} has {success, data, error} shape`);
    } else {
      fail(`GET ${path} has {success, data, error} shape`, JSON.stringify(r.json));
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Public API — unknown username
// ─────────────────────────────────────────────────────────────────────────────
async function testPublicUnknownUser() {
  suite('Public API — Unknown Username');

  const resources = ['projects', 'experience', 'skills', 'contact', 'resume'];
  for (const resource of resources) {
    const r = await req('GET', `/unknown-user-xyz/${resource}`);
    assertError(`GET /:unknown/${resource} → 404 NOT_FOUND`, r, 404, 'NOT_FOUND');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: Auth barriers — all protected routes return 401 without token
// ─────────────────────────────────────────────────────────────────────────────
async function testAuthBarriers() {
  suite('Auth Barriers (no token → 401)');

  const protectedRoutes = [
    ['GET',    '/me'],
    ['GET',    '/skills'],
    ['POST',   '/skills'],
    ['GET',    '/projects'],
    ['POST',   '/projects'],
    ['GET',    '/experience'],
    ['POST',   '/experience'],
    ['GET',    '/contact'],
    ['POST',   '/contact'],
    ['GET',    '/social-accounts'],
    ['POST',   '/social-accounts'],
    ['GET',    '/resume'],
    ['POST',   '/resume'],
    ['POST',   '/upload'],
  ];

  for (const [method, path] of protectedRoutes) {
    const r = await req(method, path, { body: method !== 'GET' ? {} : undefined });
    if (r.status === 401 || r.status === 403) {
      pass(`${method} ${path} → ${r.status} (auth required)`);
    } else if (r.status >= 400 && r.status < 600) {
      warn(`${method} ${path} → ${r.status} (blocked, but expected 401)`, 'Likely invalid CLERK_PUBLISHABLE_KEY — fix key to get proper 401');
    } else {
      fail(`${method} ${path} → 401/403 without token`, `Got: ${r.status} — route is publicly accessible!`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: Auth-gated CRUD — Skills
// ─────────────────────────────────────────────────────────────────────────────
async function testSkillsCRUD(token) {
  suite('Skills CRUD');

  // Create skill 1
  let r = await req('POST', '/skills', { token, body: { name: 'React' } });
  if (assertSuccess('POST /skills {name:"React"} → 201', r, 201)) {
    state.skillId1 = r.json.data?.id;
    if (!state.skillId1) { fail('skill 1 id present in response'); }
    else { pass('skill 1 id present in response'); }
  }

  // Create skill 2
  r = await req('POST', '/skills', { token, body: { name: 'Node.js' } });
  if (assertSuccess('POST /skills {name:"Node.js"} → 201', r, 201)) {
    state.skillId2 = r.json.data?.id;
  }

  // List skills
  r = await req('GET', '/skills', { token });
  if (assertSuccess('GET /skills → 200', r)) {
    if (Array.isArray(r.json.data) && r.json.data.length >= 2) {
      pass('GET /skills returns array with ≥2 items');
    } else {
      fail('GET /skills returns array with ≥2 items', `Got: ${JSON.stringify(r.json.data)}`);
    }
  }

  // Update
  if (state.skillId1) {
    r = await req('PUT', `/skills/${state.skillId1}`, { token, body: { name: 'React (updated)' } });
    assertSuccess('PUT /skills/:id → 200', r);
  }

  // Delete non-existent → 404
  r = await req('DELETE', `/skills/${FAKE_UUID}`, { token });
  assertError('DELETE /skills/:fake-id → 404', r, 404, 'NOT_FOUND');

  // Validation: empty name
  r = await req('POST', '/skills', { token, body: { name: '' } });
  assertError('POST /skills {name:""} → 400 VALIDATION_ERROR', r, 400, 'VALIDATION_ERROR');

  // Validation: name > 100 chars
  r = await req('POST', '/skills', { token, body: { name: 'a'.repeat(101) } });
  assertError('POST /skills {name: 101 chars} → 400 VALIDATION_ERROR', r, 400, 'VALIDATION_ERROR');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Auth-gated CRUD — Projects
// ─────────────────────────────────────────────────────────────────────────────
async function testProjectsCRUD(token) {
  suite('Projects CRUD');

  const skillIds = [state.skillId1, state.skillId2].filter(Boolean);

  // Create
  let r = await req('POST', '/projects', {
    token,
    body: {
      title: 'Test Project',
      description: 'A test project for Phase 1',
      githubUrl: 'https://github.com/test/repo',
      liveUrl: 'https://test.dev',
      tags: ['React', 'Node.js'],
      skillIds,
    },
  });
  if (assertSuccess('POST /projects → 201', r, 201)) {
    state.projectId = r.json.data?.id;
    const data = r.json.data;
    if (Array.isArray(data?.projectTags) && data.projectTags.length === 2) {
      pass('projectTags nested correctly (2 tags)');
    } else {
      fail('projectTags nested correctly (2 tags)', JSON.stringify(data?.projectTags));
    }
    if (Array.isArray(data?.projectSkills) && data.projectSkills.length === skillIds.length) {
      pass(`projectSkills nested correctly (${skillIds.length} skills)`);
    } else {
      warn('projectSkills check', `skillIds were ${JSON.stringify(skillIds)}, got ${JSON.stringify(data?.projectSkills)}`);
    }
  }

  // List
  r = await req('GET', '/projects', { token });
  if (assertSuccess('GET /projects → 200', r)) {
    if (Array.isArray(r.json.data) && r.json.data.length >= 1) {
      pass('GET /projects returns array with ≥1 item');
    } else {
      fail('GET /projects returns array with ≥1 item', JSON.stringify(r.json.data));
    }
  }

  // Get by ID
  if (state.projectId) {
    r = await req('GET', `/projects/${state.projectId}`, { token });
    assertSuccess('GET /projects/:id → 200', r);
  }

  // Update (tags replaced)
  if (state.projectId) {
    r = await req('PUT', `/projects/${state.projectId}`, {
      token,
      body: { title: 'Updated Project', tags: ['Vue'], skillIds: [] },
    });
    if (assertSuccess('PUT /projects/:id → 200 (tags replaced)', r)) {
      const tags = r.json.data?.projectTags;
      if (Array.isArray(tags) && tags.length === 1 && tags[0].tag.name === 'Vue') {
        pass('tags replaced correctly on update');
      } else {
        fail('tags replaced correctly on update', JSON.stringify(tags));
      }
    }
  }

  // Get non-existent
  r = await req('GET', `/projects/${FAKE_UUID}`, { token });
  assertError('GET /projects/:fake-id → 404', r, 404, 'NOT_FOUND');

  // Validation: missing title
  r = await req('POST', '/projects', { token, body: { description: 'no title' } });
  assertError('POST /projects (no title) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: title too long
  r = await req('POST', '/projects', { token, body: { title: 'a'.repeat(101) } });
  assertError('POST /projects (title 101 chars) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: invalid URL
  r = await req('POST', '/projects', { token, body: { title: 'Valid', githubUrl: 'not-a-url' } });
  assertError('POST /projects (invalid githubUrl) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: description too long
  r = await req('POST', '/projects', { token, body: { title: 'Valid', description: 'a'.repeat(501) } });
  assertError('POST /projects (description 501 chars) → 400', r, 400, 'VALIDATION_ERROR');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: Auth-gated CRUD — Experience
// ─────────────────────────────────────────────────────────────────────────────
async function testExperienceCRUD(token) {
  suite('Experience CRUD');

  // Create (with endDate)
  let r = await req('POST', '/experience', {
    token,
    body: {
      company: 'Acme Corp',
      role: 'Frontend Developer',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2025-06-01T00:00:00.000Z',
      description: 'Built dashboards and components',
      skillIds: state.skillId1 ? [state.skillId1] : [],
    },
  });
  if (assertSuccess('POST /experience (with endDate) → 201', r, 201)) {
    state.experienceId = r.json.data?.id;
    const skills = r.json.data?.experienceSkills;
    if (state.skillId1 && Array.isArray(skills) && skills.length === 1) {
      pass('experienceSkills nested correctly');
    } else if (!state.skillId1) {
      skip('experienceSkills check', 'no skillId available');
    } else {
      fail('experienceSkills nested correctly', JSON.stringify(skills));
    }
  }

  // Create (null endDate — current job)
  r = await req('POST', '/experience', {
    token,
    body: {
      company: 'Current Co',
      role: 'Dev',
      startDate: '2025-01-01T00:00:00.000Z',
    },
  });
  if (assertSuccess('POST /experience (null endDate) → 201', r, 201)) {
    if (r.json.data?.endDate === null) {
      pass('endDate is null for current job');
    } else {
      fail('endDate is null for current job', `Got: ${r.json.data?.endDate}`);
    }
  }

  // List
  r = await req('GET', '/experience', { token });
  if (assertSuccess('GET /experience → 200', r)) {
    if (Array.isArray(r.json.data) && r.json.data.length >= 2) {
      pass('GET /experience returns ≥2 items');
    } else {
      fail('GET /experience returns ≥2 items', JSON.stringify(r.json.data));
    }
  }

  // Validation: endDate before startDate
  r = await req('POST', '/experience', {
    token,
    body: {
      company: 'Bad Co',
      role: 'Dev',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z',
    },
  });
  assertError('POST /experience (endDate before startDate) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: missing company
  r = await req('POST', '/experience', { token, body: { role: 'Dev', startDate: '2024-01-01T00:00:00.000Z' } });
  assertError('POST /experience (missing company) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: invalid date format
  r = await req('POST', '/experience', { token, body: { company: 'X', role: 'Y', startDate: 'not-a-date' } });
  assertError('POST /experience (invalid startDate) → 400', r, 400, 'VALIDATION_ERROR');

  // Update
  if (state.experienceId) {
    r = await req('PUT', `/experience/${state.experienceId}`, {
      token,
      body: {
        company: 'Acme Corp Updated',
        role: 'Senior Frontend Developer',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2025-06-01T00:00:00.000Z',
        skillIds: [],
      },
    });
    assertSuccess('PUT /experience/:id → 200', r);
  }

  // Delete non-existent
  r = await req('DELETE', `/experience/${FAKE_UUID}`, { token });
  assertError('DELETE /experience/:fake-id → 404', r, 404, 'NOT_FOUND');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 8: Auth-gated CRUD — Contact + Social Accounts
// ─────────────────────────────────────────────────────────────────────────────
async function testContactCRUD(token) {
  suite('Contact + Social Accounts');

  // GET before creation → 404
  let r = await req('GET', '/contact', { token });
  if (r.status === 404) {
    pass('GET /contact (before creation) → 404');
  } else if (r.status === 200) {
    warn('GET /contact (before creation)', 'Contact already exists (previous test run) — testing upsert path');
  } else {
    fail('GET /contact (before creation) → 404', `Got: ${r.status}`);
  }

  // Create contact
  r = await req('POST', '/contact', {
    token,
    body: {
      name: 'Test User',
      email: 'test@example.com',
      mobile: '+91 9876543210',
      googleMapsUrl: 'https://maps.google.com/?q=Indore',
    },
  });
  assertSuccess('POST /contact (create) → 200', r);

  // Call POST again — should upsert, not duplicate
  r = await req('POST', '/contact', {
    token,
    body: { name: 'Test User Updated', email: 'test@example.com' },
  });
  assertSuccess('POST /contact (upsert) → 200 (no duplicate)', r);

  // GET contact
  r = await req('GET', '/contact', { token });
  if (assertSuccess('GET /contact → 200', r)) {
    if (r.json.data?.name === 'Test User Updated') {
      pass('contact name updated correctly by upsert');
    } else {
      fail('contact name updated correctly by upsert', `Got: ${r.json.data?.name}`);
    }
  }

  // Validation: invalid email
  r = await req('POST', '/contact', { token, body: { name: 'Test', email: 'not-an-email' } });
  assertError('POST /contact (invalid email) → 400', r, 400, 'VALIDATION_ERROR');

  // Validation: missing required fields
  r = await req('POST', '/contact', { token, body: { mobile: '123' } });
  assertError('POST /contact (missing name+email) → 400', r, 400, 'VALIDATION_ERROR');

  // Social: create
  r = await req('POST', '/social-accounts', {
    token,
    body: { platform: 'GitHub', url: 'https://github.com/testuser' },
  });
  if (assertSuccess('POST /social-accounts → 201', r, 201)) {
    state.socialAccountId = r.json.data?.id;
  }

  // Social: list
  r = await req('GET', '/social-accounts', { token });
  if (assertSuccess('GET /social-accounts → 200', r)) {
    if (Array.isArray(r.json.data) && r.json.data.length >= 1) {
      pass('GET /social-accounts returns ≥1 item');
    } else {
      fail('GET /social-accounts returns ≥1 item', JSON.stringify(r.json.data));
    }
  }

  // Social: invalid URL
  r = await req('POST', '/social-accounts', {
    token,
    body: { platform: 'LinkedIn', url: 'linkedin.com/in/test' },
  });
  assertError('POST /social-accounts (non-https URL) → 400', r, 400, 'VALIDATION_ERROR');

  // Social: update
  if (state.socialAccountId) {
    r = await req('PUT', `/social-accounts/${state.socialAccountId}`, {
      token,
      body: { platform: 'GitHub', url: 'https://github.com/updated' },
    });
    assertSuccess('PUT /social-accounts/:id → 200', r);
  }

  // Social: delete non-existent
  r = await req('DELETE', `/social-accounts/${FAKE_UUID}`, { token });
  assertError('DELETE /social-accounts/:fake-id → 404', r, 404, 'NOT_FOUND');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 9: Upload middleware — MIME/size rejection (no Cloudinary needed)
// ─────────────────────────────────────────────────────────────────────────────
async function testUploadValidation(token) {
  suite('Upload Middleware Validation');

  // Build a minimal multipart/form-data body with a .txt file (wrong MIME)
  const boundary = '----TestBoundary12345';
  const filename = 'test.txt';
  const content = Buffer.from('hello world');

  const parts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`,
    `Content-Type: text/plain\r\n`,
    `\r\n`,
  ];
  const partsBuffer = Buffer.from(parts.join(''));
  const closing = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([partsBuffer, content, closing]);

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const json = await res.json().catch(() => null);

  if (res.status === 400 && json?.error?.code === 'INVALID_FILE_TYPE') {
    pass('POST /upload (text/plain) → 400 INVALID_FILE_TYPE');
  } else {
    fail('POST /upload (text/plain) → 400 INVALID_FILE_TYPE', `Got: ${res.status} ${JSON.stringify(json?.error)}`);
  }

  // POST /resume with no file
  const emptyBoundary = '----EmptyBoundary';
  const emptyBody = Buffer.from(`--${emptyBoundary}--\r\n`);
  const res2 = await fetch(`${BASE}/resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${emptyBoundary}`,
    },
    body: emptyBody,
  });
  const json2 = await res2.json().catch(() => null);
  if (res2.status === 400 && json2?.error?.code === 'NO_FILE') {
    pass('POST /resume (no file field) → 400 NO_FILE');
  } else {
    fail('POST /resume (no file field) → 400 NO_FILE', `Got: ${res2.status} ${JSON.stringify(json2?.error)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 10: Public API with real data
// ─────────────────────────────────────────────────────────────────────────────
async function testPublicWithData(token) {
  suite('Public API — with real data');

  // Get username from /me
  const meRes = await req('GET', '/me', { token });
  if (!meRes.json?.data?.username) {
    fail('GET /me for username', 'Cannot run public data tests without username');
    return;
  }

  const username = meRes.json.data.username;
  console.log(`  ${c.dim(`using username: ${username}`)}`);

  const publicResources = ['projects', 'experience', 'skills'];
  for (const resource of publicResources) {
    const r = await req('GET', `/${username}/${resource}`);
    if (assertSuccess(`GET /:username/${resource} (no auth) → 200`, r)) {
      if (Array.isArray(r.json.data)) {
        pass(`GET /:username/${resource} returns array`);
      } else {
        fail(`GET /:username/${resource} returns array`, JSON.stringify(r.json.data));
      }
    }
  }

  // Contact returns object with contact + socialAccounts
  const contactRes = await req('GET', `/${username}/contact`);
  if (assertSuccess('GET /:username/contact (no auth) → 200', contactRes)) {
    const d = contactRes.json.data;
    if ('contact' in d && 'socialAccounts' in d) {
      pass('contact response has {contact, socialAccounts} shape');
    } else {
      fail('contact response has {contact, socialAccounts} shape', JSON.stringify(d));
    }
  }

  // Resume → 404 (we didn't upload one in these tests)
  const resumeRes = await req('GET', `/${username}/resume`);
  if (resumeRes.status === 404 || resumeRes.status === 200) {
    pass(`GET /:username/resume → ${resumeRes.status} (acceptable)`);
  } else {
    fail('GET /:username/resume → 200 or 404', `Got: ${resumeRes.status}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 11: Cleanup — delete created data
// ─────────────────────────────────────────────────────────────────────────────
async function testCleanup(token) {
  suite('Cleanup (delete test data)');

  if (state.socialAccountId) {
    const r = await req('DELETE', `/social-accounts/${state.socialAccountId}`, { token });
    assertSuccess(`DELETE /social-accounts/${state.socialAccountId}`, r);
  }

  const r2 = await req('DELETE', '/contact', { token });
  if (r2.status === 200 || r2.status === 404) { pass('DELETE /contact (or 404 if missing)'); }
  else { fail('DELETE /contact', `Got: ${r2.status}`); }

  if (state.projectId) {
    const r = await req('DELETE', `/projects/${state.projectId}`, { token });
    assertSuccess(`DELETE /projects/${state.projectId}`, r);
  }

  for (const [label, id] of [['skill1', state.skillId1], ['skill2', state.skillId2]]) {
    if (id) {
      const r = await req('DELETE', `/skills/${id}`, { token });
      if (r.status === 200 || r.status === 404) { pass(`DELETE ${label}`); }
      else { fail(`DELETE ${label}`, `Got: ${r.status}`); }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(c.bold('\n╔════════════════════════════════════════╗'));
  console.log(c.bold('║   Stratum CMS — Phase 1 Test Runner    ║'));
  console.log(c.bold('╚════════════════════════════════════════╝'));
  console.log(`  Base URL : ${c.cyan(BASE)}`);
  console.log(`  Auth     : ${TEST_TOKEN ? c.green('TEST_TOKEN provided — running full CRUD tests') : c.yellow('No TEST_TOKEN — running public + 401 tests only')}`);

  try {
    await testInfrastructure();
    await testResponseFormat();
    await testPublicUnknownUser();
    await testAuthBarriers();

    if (TEST_TOKEN) {
      await testSkillsCRUD(TEST_TOKEN);
      await testProjectsCRUD(TEST_TOKEN);
      await testExperienceCRUD(TEST_TOKEN);
      await testContactCRUD(TEST_TOKEN);
      await testUploadValidation(TEST_TOKEN);
      await testPublicWithData(TEST_TOKEN);
      await testCleanup(TEST_TOKEN);
    } else {
      suite('CRUD + Validation Tests (skipped — no TEST_TOKEN)');
      const skippedSuites = ['Skills CRUD', 'Projects CRUD', 'Experience CRUD', 'Contact + Social Accounts', 'Upload Validation', 'Public API with data', 'Cleanup'];
      for (const s of skippedSuites) {
        skip(s, 'set TEST_TOKEN=<clerk-jwt> to run');
      }
    }
  } catch (err) {
    console.error(c.red(`\n[FATAL] Test runner crashed: ${err.message}`));
    console.error(err.stack);
  }

  // ─── Summary ────────────────────────────────────────────────────────────────
  const total = results.pass + results.fail + results.skip;
  console.log(c.bold('\n╔════════════════════════════════════════╗'));
  console.log(c.bold('║              Test Summary              ║'));
  console.log(c.bold('╚════════════════════════════════════════╝'));
  console.log(`  ${c.green(`✓ ${results.pass} passed`)}   ${c.red(`✗ ${results.fail} failed`)}   ${c.yellow(`○ ${results.skip} skipped`)}   ${c.yellow(`⚠ ${results.warn} warnings`)}`);
  console.log(`  Total: ${total}`);

  if (failures.length > 0) {
    console.log(c.bold(c.red('\n  Failed tests:')));
    failures.forEach(({ msg, detail }) => {
      console.log(`  ${c.red('✗')} ${msg}`);
      if (detail) { console.log(`    ${c.dim(detail)}`); }
    });
  }

  if (!TEST_TOKEN) {
    console.log(c.yellow('\n  To run full CRUD + validation tests:'));
    console.log(c.dim('  1. Open the test HTML page described in the testing guide'));
    console.log(c.dim('  2. Sign in with Clerk, click "Get Token", copy the JWT'));
    console.log(c.dim('  3. Re-run: TEST_TOKEN=<jwt> node test-phase1.js'));
  }

  console.log('');
  process.exit(results.fail > 0 ? 1 : 0);
}

main();
