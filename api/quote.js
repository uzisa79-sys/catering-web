const { sb, send, fail, route, num, getSettings, calcTotals } = require('../lib/common');

const str = (v, max) => String(v ?? '').trim().slice(0, max);

module.exports = route(['POST'], async (req, res) => {
  const b = req.body || {};
  if (b.website) return send(res, 200, { ok: true }); // honeypot: botlar doldurur

  const name = str(b.name, 100), phone = str(b.phone, 30), email = str(b.email, 120);
  const people = Math.floor(num(b.people));
  const date = str(b.event_date, 10);
  if (name.length < 2) return fail(res, 400, 'Lütfen adınızı girin.');
  if (phone.replace(/\D/g, '').length < 10) return fail(res, 400, 'Lütfen geçerli bir telefon numarası girin.');
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(res, 400, 'E-posta adresi geçersiz.');
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, 'Tarih geçersiz.');
  if (b.consent !== true) return fail(res, 400, 'Devam etmek için onay kutusunu işaretleyin.');

  const settings = await getSettings();
  const minP = num(settings.min_people, 20);
  if (people < minP) return fail(res, 400, `Kişi sayısı en az ${minP} olmalıdır.`);
  if (people > 100000) return fail(res, 400, 'Kişi sayısı geçersiz.');

  const ids = [...new Set(Array.isArray(b.dish_ids) ? b.dish_ids.map(String) : [])].slice(0, 60);
  if (!ids.length) return fail(res, 400, 'Lütfen en az bir yemek seçin.');

  // Fiyatlar her zaman veritabanından okunur; istemciden gelen fiyata güvenilmez.
  const [d, c] = await Promise.all([
    sb().from('dishes').select('id,name,price,category_id').in('id', ids).eq('active', true),
    sb().from('categories').select('id,name,max_select'),
  ]);
  if (d.error) throw d.error; if (c.error) throw c.error;
  if (d.data.length !== ids.length) return fail(res, 400, 'Seçilen yemeklerden biri artık mevcut değil. Sayfayı yenileyin.');

  const cats = Object.fromEntries(c.data.map((x) => [x.id, x]));
  const count = {};
  for (const x of d.data) {
    count[x.category_id] = (count[x.category_id] || 0) + 1;
    const cat = cats[x.category_id];
    if (cat && cat.max_select > 0 && count[x.category_id] > cat.max_select)
      return fail(res, 400, `${cat.name} kategorisinden en fazla ${cat.max_select} seçim yapabilirsiniz.`);
  }
  const per = d.data.reduce((a, x) => a + num(x.price), 0);
  const t = calcTotals(settings, per, people);
  const items = d.data.map((x) => ({ id: x.id, name: x.name, price: num(x.price), category: cats[x.category_id]?.name || '' }));

  const { data, error } = await sb().from('quotes').insert({
    name, phone, email: email || null, event_type: str(b.event_type, 80), event_date: date || null,
    people, note: str(b.note, 1000), items, per_person: t.per_person, total: t.total,
  }).select('id').single();
  if (error) throw error;

  send(res, 200, { ok: true, ref: String(data.id).slice(0, 8).toUpperCase(), ...t, items });
});
