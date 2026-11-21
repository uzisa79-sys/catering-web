const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

let _sb;
function sb() {
  if (!_sb) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri tanımlı değil');
    _sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return _sb;
}

function send(res, code, data) {
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store');
  res.status(code).json(data);
}
const fail = (res, code, msg) => send(res, code, { error: msg });

/* ---------- Yönetici oturumu (HttpOnly çerez + HMAC imza) ---------- */
function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('ADMIN_SESSION_SECRET en az 16 karakter olmalı');
  return s;
}
const sign = (p) => crypto.createHmac('sha256', secret()).update(p).digest('base64url');
function makeToken() {
  const p = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 3600 * 1000 })).toString('base64url');
  return p + '.' + sign(p);
}
function isAdmin(req) {
  const c = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith('adm='));
  if (!c) return false;
  const [p, s] = c.slice(4).split('.');
  if (!p || !s) return false;
  const e = sign(p);
  if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
function cookie(req, value, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `adm=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${secure}`;
}

/* ---------- Route sarmalayıcı ---------- */
function route(methods, fn, { admin = false } = {}) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) { res.setHeader('Allow', methods.join(', ')); return fail(res, 405, 'Yöntem desteklenmiyor'); }
      if (admin && !isAdmin(req)) return fail(res, 401, 'Oturum gerekli');
      await fn(req, res);
    } catch (e) {
      console.error(e);
      fail(res, 500, 'Sunucu hatası: ' + (process.env.NODE_ENV === 'development' ? e.message : 'lütfen tekrar deneyin'));
    }
  };
}

/* ---------- Ortak veri yardımcıları ---------- */
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
async function getSettings() {
  const { data, error } = await sb().from('settings').select('key,value');
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}
/* Fiyat hesabı: istemci (public/js/app.js) ile aynı formül */
function calcTotals(s, perPerson, people) {
  const sub = perPerson * people;
  const disc = people >= num(s.discount_from, 100) && num(s.discount_pct) ? (sub * num(s.discount_pct)) / 100 : 0;
  const net = sub - disc;
  const vat = (net * num(s.vat_pct, 10)) / 100;
  const r = (x) => Math.round(x * 100) / 100;
  return { per_person: r(perPerson), sub: r(sub), discount: r(disc), vat: r(vat), total: r(net + vat) };
}
module.exports = { sb, send, fail, route, makeToken, isAdmin, cookie, num, getSettings, calcTotals };
