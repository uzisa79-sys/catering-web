const { sb, send, fail, route } = require('../../lib/common');

const KEYS = ['brand', 'slogan', 'hero_sub', 'hero_image', 'about', 'years', 'districts', 'phone', 'whatsapp', 'email',
  'address', 'hours', 'min_people', 'discount_from', 'discount_pct', 'vat_pct'];

module.exports = route(['POST'], async (req, res) => {
  const v = (req.body || {}).values;
  if (!v || typeof v !== 'object') return fail(res, 400, 'Geçersiz istek.');
  const rows = KEYS.filter((k) => k in v).map((k) => ({ key: k, value: String(v[k] ?? '').slice(0, 4000) }));
  for (const r of rows) {
    if (['min_people', 'discount_from', 'discount_pct', 'vat_pct'].includes(r.key) && !(Number(r.value) >= 0))
      return fail(res, 400, 'Sayısal alanlara geçerli bir sayı girin.');
  }
  const { error } = await sb().from('settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  send(res, 200, { ok: true });
}, { admin: true });
