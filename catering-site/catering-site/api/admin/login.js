const crypto = require('crypto');
const { send, fail, route, makeToken, cookie } = require('../../lib/common');

const tries = new Map(); // IP başına deneme sayısı (sunucusuz ortamda "en iyi çaba" sınırlaması)
const h = (s) => crypto.createHash('sha256').update(String(s)).digest();

module.exports = route(['POST'], async (req, res) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) return fail(res, 500, 'ADMIN_PASSWORD ortam değişkeni tanımlı değil (en az 8 karakter).');
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
  const t = tries.get(ip) || { n: 0, at: Date.now() };
  if (Date.now() - t.at > 15 * 60 * 1000) { t.n = 0; t.at = Date.now(); }
  if (t.n >= 5) return fail(res, 429, 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.');
  const okPw = crypto.timingSafeEqual(h((req.body || {}).password || ''), h(expected));
  if (!okPw) {
    t.n++; tries.set(ip, t);
    await new Promise((r) => setTimeout(r, 500));
    return fail(res, 401, 'Şifre hatalı.');
  }
  tries.delete(ip);
  res.setHeader('Set-Cookie', cookie(req, makeToken(), 8 * 3600));
  send(res, 200, { ok: true });
});
