const { sb, send, route, getSettings } = require('../lib/common');

module.exports = route(['GET'], async (req, res) => {
  const q = (t, f) => { let x = sb().from(t).select('*'); if (f) x = f(x); return x.order('sort', { ascending: true }); };
  const [settings, cats, dishes, services, gallery, why, reviews, faq] = await Promise.all([
    getSettings(),
    q('categories'),
    q('dishes', (x) => x.eq('active', true)),
    q('services'), q('gallery'), q('why_us'), q('reviews'), q('faq'),
  ]);
  for (const r of [cats, dishes, services, gallery, why, reviews, faq]) if (r.error) throw r.error;
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');
  send(res, 200, {
    settings, categories: cats.data, dishes: dishes.data, services: services.data,
    gallery: gallery.data, why_us: why.data, reviews: reviews.data, faq: faq.data,
  });
});
