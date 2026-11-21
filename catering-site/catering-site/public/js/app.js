(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const tl = (n) => (Math.round(num(n)) || 0).toLocaleString('tr-TR') + ' ₺';
  const bg = (u) => (u ? ` style="background-image:url('${esc(encodeURI(u))}')"` : '');

  let C = null, ac = 0, R = {};
  const S = new Set();
  const cfg = () => {
    const s = C.settings;
    return { min: num(s.min_people, 20), from: num(s.discount_from, 100), pct: num(s.discount_pct), vat: num(s.vat_pct, 10) };
  };
  const catOf = (d) => C.categories.find((c) => c.id === d.category_id) || {};

  async function boot() {
    try {
      const r = await fetch('/api/content');
      if (!r.ok) throw new Error(r.status);
      C = await r.json();
    } catch (e) {
      $('#app').innerHTML = '<p class="boot">Site içeriği yüklenemedi. Lütfen sayfayı yenileyin.</p>';
      return;
    }
    render();
  }

  function render() {
    const s = C.settings, k = cfg(), tel = esc((s.phone || '').replace(/\s/g, ''));
    document.title = `${s.brand || 'Catering'} | ${s.slogan || ''}`;
    $('#app').innerHTML = `
<div class="top"><div class="w"><span>${esc(s.hours)}</span><div><a href="tel:${tel}">${esc(s.phone)}</a><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div></div></div>
<nav><div class="w"><a class="logo" href="#top">✦ <b>${esc(s.brand)}</b></a>
<div class="l" id="lk"><a href="#hizmetler">Hizmetler</a><a href="#menu-olustur">Menü Oluştur</a><a href="#hakkimizda">Kurumsal</a><a href="#galeri">Galeri</a><a href="#sss">SSS</a><a href="#iletisim">İletişim</a><a class="btn s" href="#menu-olustur">Teklif Al</a></div>
<button id="bg" aria-label="Menü">☰</button></div></nav>
<header class="hero" id="top"${s.hero_image ? ` style="background-image:linear-gradient(105deg,#0f2d22f0 45%,#14382b88),url('${esc(encodeURI(s.hero_image))}')"` : ''}><div class="w"><div>
<span class="ey" style="color:#d9b95c">${esc(s.years)}’den beri · İstanbul</span><h1>${esc(s.slogan)}</h1><p>${esc(s.hero_sub)}</p>
<ul class="ck"><li>Kurumsal ve bireysel etkinlikler<li>Kendi menünüzü oluşturun<li>Kişi sayısına göre anında fiyat</ul></div>
<div class="card"><h3>Hızlı Teklif</h3><label for="hk">Kişi sayısı</label><input id="hk" type="number" min="1" value="50"><label for="hd">Etkinlik tarihi</label><input id="hd" type="date"><button class="btn full" id="hg">Menümü Oluştur →</button></div></div></header>
<div class="w st"><div><b>${esc(s.years)}</b>yılından beri</div><div><b>${esc(s.districts)}</b>ilçede hizmet</div><div><b>${C.dishes.length}</b>menü seçeneği</div></div>
<section id="hizmetler"><div class="w"><div class="t"><span class="ey">Hizmetler</span><h2>Catering ve Organizasyon Hizmetlerimiz</h2></div><div class="g">${C.services.map((x) => `<div class="c sv rvl"><i>${esc(x.icon)}</i><h3>${esc(x.title)}</h3><p style="color:var(--mu)">${esc(x.text)}</p></div>`).join('')}</div></div></section>
<section class="alt" id="menu-olustur"><div class="w"><div class="t"><span class="ey">Menü Oluşturucu</span><h2>Kendi Menünüzü Seçin</h2><p>Her kategoriden yemekleri seçin; kişi başı ve toplam fiyat anında hesaplanır.</p></div>
<div class="bl"><div><div class="tabs" id="ct"></div><div class="g" id="dg"></div></div>
<aside class="card sum"><h3>Menünüz</h3><div id="sl"></div>
<label for="bk">Kişi sayısı (en az ${k.min})</label><input id="bk" type="number" min="1" value="50"><div class="pt" id="pt"></div>
<div class="two"><div><label for="bn">Ad Soyad</label><input id="bn" maxlength="100" autocomplete="name"></div><div><label for="bp">Telefon</label><input id="bp" type="tel" maxlength="30" autocomplete="tel"></div></div>
<label for="be">E-posta (isteğe bağlı)</label><input id="be" type="email" maxlength="120" autocomplete="email">
<div class="two"><div><label for="bd">Etkinlik tarihi</label><input id="bd" type="date"></div><div><label for="bt">Etkinlik türü</label><select id="bt">${C.services.map((x) => `<option>${esc(x.title)}</option>`).join('')}<option>Diğer</option></select></div></div>
<label for="bo">Notunuz</label><textarea id="bo" maxlength="1000"></textarea>
<input class="hp" id="bw" tabindex="-1" autocomplete="off" aria-hidden="true">
<label class="chk"><input type="checkbox" id="bc"><span>Kişisel verilerimin teklif hazırlanması ve benimle iletişime geçilmesi amacıyla işlenmesini kabul ediyorum.</span></label>
<div class="er" id="er" role="alert"></div><button class="btn full" id="bs">Teklif İste</button><div id="done"></div></aside></div></div></section>
<section id="hakkimizda"><div class="w"><div class="t"><span class="ey">Farkımız</span><h2>Neden ${esc(s.brand)}?</h2><p>${esc(s.about)}</p></div><div class="g">${C.why_us.map((w, i) => `<div class="c cb rvl"><div class="nm">${i + 1}</div><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div>`).join('')}</div></div></section>
<section class="alt"><div class="w"><div class="t"><span class="ey">Süreç</span><h2>Organizasyon Nasıl İlerler?</h2></div><div class="g">${[['Menünüzü seçin', 'Yemekleri seçin, fiyatı görün.'], ['Teklifi gönderin', 'Formu doldurun, talebiniz bize ulaşsın.'], ['Planlama', 'Servis düzeni ve ekipmanı netleştirelim.'], ['Etkinlik günü', 'Kurulum, servis ve toplama bizde.']].map((x, i) => `<div class="c cb rvl"><div class="nm">${i + 1}</div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div></div></section>
${C.gallery.length ? `<section id="galeri"><div class="w"><div class="t"><span class="ey">Galeri</span><h2>Gerçekleştirdiğimiz Organizasyonlar</h2></div><div class="gl">${C.gallery.map((x) => `<div class="pic rvl"${bg(x.image_url)}><span>${esc(x.caption)}</span></div>`).join('')}</div></div></section>` : ''}
${C.reviews.length ? `<section class="alt"><div class="w"><div class="t"><span class="ey">Referanslar</span><h2>Müşteri Yorumları</h2></div><div class="g">${C.reviews.map((r) => `<div class="c cb rvl"><p style="font-style:italic;font-size:16px;color:var(--tx)">“${esc(r.text)}”</p><b>— ${esc(r.name)}</b></div>`).join('')}</div></div></section>` : ''}
${C.faq.length ? `<section id="sss"><div class="w" style="max-width:800px"><div class="t"><span class="ey">SSS</span><h2>Sık Sorulan Sorular</h2></div>${C.faq.map((f) => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section>` : ''}
<section class="ct" id="iletisim"><div class="w"><div class="t"><h2>Etkinliğiniz için teklif alın</h2><p style="color:#cfd8d2">Tarih, kişi sayısı ve menünüzü iletin; size dönelim.</p></div><div class="g" style="text-align:center"><div><h3>Telefon</h3><a href="tel:${tel}">${esc(s.phone)}</a></div><div><h3>E-posta</h3><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div><div><h3>Adres</h3>${esc(s.address)}</div><div><h3>WhatsApp</h3><a class="btn" href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">Yazın</a></div></div></div></section>
<footer><div class="w"><div class="g"><div><h3>${esc(s.brand)}</h3>${esc(s.address)}</div><div><h3>Çalışma Saatleri</h3>${esc(s.hours)}</div><div><h3>İletişim</h3>${esc(s.phone)}<br>${esc(s.email)}</div></div><p style="text-align:center;margin-top:28px">© ${new Date().getFullYear()} ${esc(s.brand)}. Tüm hakları saklıdır.</p></div></footer>
<a class="wa" href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>`;

    $('#bg').addEventListener('click', () => $('#lk').classList.toggle('on'));
    $('#lk').addEventListener('click', () => $('#lk').classList.remove('on'));
    $('#hg').addEventListener('click', () => { $('#bk').value = $('#hk').value; $('#bd').value = $('#hd').value; calc(); $('#menu-olustur').scrollIntoView(); });
    $('#bk').addEventListener('input', calc);
    $('#bs').addEventListener('click', submit);
    drawDishes(); calc();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }));
    document.querySelectorAll('.rvl').forEach((x) => io.observe(x));
    setTimeout(() => document.querySelectorAll('.rvl').forEach((x) => x.classList.add('in')), 1500);
  }

  function drawDishes() {
    const cs = C.categories;
    if (!cs.length) { $('#dg').innerHTML = '<p>Menü yakında eklenecek.</p>'; return; }
    if (ac >= cs.length) ac = 0;
    const cc = cs[ac];
    $('#ct').innerHTML = cs.map((c, i) => {
      const n = C.dishes.filter((d) => d.category_id === c.id && S.has(d.id)).length;
      return `<button data-ct="${i}" class="${i === ac ? 'on' : ''}">${esc(c.icon)} ${esc(c.name)}${n ? `<i>${n}</i>` : ''}</button>`;
    }).join('');
    const list = C.dishes.filter((d) => d.category_id === cc.id);
    $('#dg').innerHTML = list.map((d) => `<div class="c dc ${S.has(d.id) ? 'on' : ''}" data-pk="${esc(d.id)}"><div class="pic"${bg(d.image_url)}>${d.image_url ? '' : esc(cc.icon)}</div><span class="tk">✓ Seçildi</span><div class="cb"><h3>${esc(d.name)}</h3><p>${esc(d.description)}</p><span class="pr">${tl(d.price)} / kişi</span></div></div>`).join('') || '<p>Bu kategoride ürün yok.</p>';
    $('#ct').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { ac = +b.dataset.ct; drawDishes(); }));
    $('#dg').querySelectorAll('.dc').forEach((b) => b.addEventListener('click', () => pick(b.dataset.pk)));
  }

  function pick(id) {
    const d = C.dishes.find((x) => x.id === id), c = catOf(d), e = $('#er');
    if (S.has(id)) S.delete(id);
    else {
      const n = C.dishes.filter((x) => x.category_id === d.category_id && S.has(x.id)).length;
      if (c.max_select > 0 && n >= c.max_select) { e.className = 'er'; e.textContent = `${c.name} kategorisinden en fazla ${c.max_select} seçim yapabilirsiniz.`; return; }
      S.add(id);
    }
    e.textContent = ''; drawDishes(); calc();
  }

  function calc() {
    const k = cfg(), n = Math.max(0, Math.floor(num($('#bk').value)));
    const sel = C.dishes.filter((d) => S.has(d.id));
    const pp = sel.reduce((a, d) => a + num(d.price), 0), sub = pp * n;
    const dc = n >= k.from && k.pct ? (sub * k.pct) / 100 : 0, net = sub - dc, vat = (net * k.vat) / 100, tot = net + vat;
    R = { n, sel, pp, tot };
    $('#sl').innerHTML = sel.length ? C.categories.map((c) => {
      const x = sel.filter((d) => d.category_id === c.id);
      return x.length ? `<div><b>${esc(c.name)}:</b> ${x.map((d) => esc(d.name)).join(', ')}<button data-rm="${x.map((d) => d.id).join(',')}" title="Kaldır">✕</button></div>` : '';
    }).join('') : '<p style="color:var(--mu);margin:0">Henüz yemek seçmediniz.</p>';
    $('#sl').querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { b.dataset.rm.split(',').forEach((i) => S.delete(i)); drawDishes(); calc(); }));
    $('#pt').innerHTML = `<div><span>Kişi başı menü</span><b>${tl(pp)}</b></div><div><span>Ara toplam (${n} kişi)</span><span>${tl(sub)}</span></div>${dc ? `<div><span>İndirim (%${k.pct})</span><span>−${tl(dc)}</span></div>` : ''}${k.vat ? `<div><span>KDV (%${k.vat})</span><span>${tl(vat)}</span></div>` : ''}<div class="tot"><span>Genel Toplam</span><span>${tl(tot)}</span></div>`;
  }

  async function submit() {
    const k = cfg(), e = $('#er'), btn = $('#bs');
    e.className = 'er'; $('#done').innerHTML = '';
    if (!R.sel.length) return (e.textContent = 'Lütfen en az bir yemek seçin.');
    if (R.n < k.min) return (e.textContent = `Kişi sayısı en az ${k.min} olmalıdır.`);
    if ($('#bn').value.trim().length < 2) return (e.textContent = 'Lütfen adınızı girin.');
    if ($('#bp').value.replace(/\D/g, '').length < 10) return (e.textContent = 'Lütfen geçerli bir telefon girin.');
    if (!$('#bc').checked) return (e.textContent = 'Devam etmek için onay kutusunu işaretleyin.');
    btn.disabled = true; e.textContent = 'Gönderiliyor…';
    try {
      const r = await fetch('/api/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: $('#bn').value, phone: $('#bp').value, email: $('#be').value, event_type: $('#bt').value, event_date: $('#bd').value, people: R.n, note: $('#bo').value, dish_ids: [...S], consent: true, website: $('#bw').value }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Gönderilemedi');
      e.textContent = '';
      const wa = `Merhaba, ${j.ref} referans numaralı teklif talebimi gönderdim. Ad: ${$('#bn').value}`;
      $('#done').innerHTML = `<p class="ok">✓ Teklif talebiniz alındı. Referans no: <b>${esc(j.ref)}</b><br>Hesaplanan genel toplam: <b>${tl(j.total)}</b> (kişi başı ${tl(j.per_person)}). En kısa sürede sizinle iletişime geçeceğiz.</p><a class="btn o s" target="_blank" rel="noopener" href="https://wa.me/${esc(C.settings.whatsapp)}?text=${encodeURIComponent(wa)}">WhatsApp’tan da yazın</a>`;
    } catch (err) {
      e.textContent = err.message || 'Bir hata oluştu, lütfen tekrar deneyin.';
    } finally { btn.disabled = false; }
  }

  boot();
})();
