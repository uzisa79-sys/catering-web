const { sb, send, fail, route, num } = require('../../lib/common');

// Yönetim panelinden yazılabilecek tablolar ve sütunlar (beyaz liste)
const TABLES = {
  categories: { cols: ['name', 'icon', 'max_select', 'sort'], nums: ['max_select', 'sort'] },
  dishes: { cols: ['category_id', 'name', 'description', 'price', 'image_url', 'active', 'sort'], nums: ['price', 'sort'], bools: ['active'] },
  services: { cols: ['icon', 'title', 'text', 'sort'], nums: ['sort'] },
  gallery: { cols: ['caption', 'image_url', 'sort'], nums: ['sort'] },
  why_us: { cols: ['title', 'text', 'sort'], nums: ['sort'] },
  reviews: { cols: ['name', 'text', 'sort'], nums: ['sort'] },
  faq: { cols: ['question', 'answer', 'sort'], nums: ['sort'] },
  quotes: { cols: ['status'], nums: [], update_only: true },
};
const STATUS = ['yeni', 'görüşüldü', 'teklif verildi', 'onaylandı', 'iptal'];

module.exports = route(['POST'], async (req, res) => {
  const { table, action, id, row } = req.body || {};
  const T = TABLES[table];
  if (!T) return fail(res, 400, 'Geçersiz tablo.');

  if (action === 'delete') {
    if (!id) return fail(res, 400, 'Kayıt kimliği eksik.');
    const { error } = await sb().from(table).delete().eq('id', id);
    if (error) throw error;
    return send(res, 200, { ok: true });
  }
  if (action !== 'save' || !row) return fail(res, 400, 'Geçersiz istek.');

  const out = {};
  for (const c of T.cols) {
    if (!(c in row)) continue;
    let v = row[c];
    if (T.nums.includes(c)) v = num(v);
    else if ((T.bools || []).includes(c)) v = v === true || v === 'true';
    else v = v === null ? null : String(v).slice(0, c === 'image_url' ? 2000 : 2000);
    out[c] = v;
  }
  if (table === 'quotes' && out.status && !STATUS.includes(out.status)) return fail(res, 400, 'Geçersiz durum.');
  if (table === 'dishes' && !row.id && !out.category_id) return fail(res, 400, 'Kategori seçin.');
  if (table === 'dishes' && out.price < 0) return fail(res, 400, 'Fiyat negatif olamaz.');

  const q = row.id ? sb().from(table).update(out).eq('id', row.id) : sb().from(table).insert(out);
  if (T.update_only && !row.id) return fail(res, 400, 'Bu tabloya kayıt eklenemez.');
  const { data, error } = await q.select().single();
  if (error) throw error;
  send(res, 200, { ok: true, row: data });
}, { admin: true });
