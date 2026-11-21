const crypto = require('crypto');
const { sb, send, fail, route } = require('../../lib/common');

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

module.exports = route(['POST'], async (req, res) => {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec((req.body || {}).dataUrl || '');
  if (!m) return fail(res, 400, 'Yalnızca JPG, PNG veya WebP yüklenebilir.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3.5 * 1024 * 1024) return fail(res, 413, 'Dosya çok büyük (en fazla 3.5 MB).');
  const path = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${EXT[m[1]]}`;
  const { error } = await sb().storage.from('images').upload(path, buf, { contentType: m[1], cacheControl: '31536000' });
  if (error) throw error;
  const { data } = sb().storage.from('images').getPublicUrl(path);
  send(res, 200, { ok: true, url: data.publicUrl });
}, { admin: true });
