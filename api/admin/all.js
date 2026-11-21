const { sb, send, route, getSettings } = require('../../lib/common');

module.exports = route(['GET'], async (req, res) => {
  const q = (t) => sb().from(t).select('*').order('sort', { ascending: true });
  const [settings, cats, dishes, services, gallery, why, reviews, faq, quotes] = await Promise.all([
    getSettings(), q('categories'), q('dishes'), q('services'), q('gallery'), q('why_us'), q('reviews'), q('faq'),
    sb().from('quotes').select('*').order('created_at', { ascending: false }).limit(300),
  ]);
  for (const r of [cats, dishes, services, gallery, why, reviews, faq, quotes]) if (r.error) throw r.error;
  send(res, 200, {
    settings, categories: cats.data, dishes: dishes.data, services: services.data, gallery: gallery.data,
    why_us: why.data, reviews: reviews.data, faq: faq.data, quotes: quotes.data,
  });
}, { admin: true });
