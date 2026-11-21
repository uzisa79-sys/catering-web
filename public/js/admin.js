(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tl = (n) => (Math.round(Number(n)) || 0).toLocaleString('tr-TR') + ' ₺';
  let D = null, tab = 'settings';

  const SET = [['brand', 'Marka adı'], ['slogan', 'Ana başlık'], ['hero_sub', 'Karşılama metni', 'ta'], ['hero_image', 'Ana sayfa arka plan fotoğrafı', 'img'], ['about', 'Kurumsal yazı', 'ta'], ['years', 'Kuruluş yılı'], ['districts', 'Hizmet verilen ilçe sayısı'], ['phone', 'Telefon'], ['whatsapp', 'WhatsApp numarası (905xxxxxxxxx)'], ['email', 'E-posta'], ['address', 'Adres'], ['hours', 'Çalışma saatleri'], ['min_people', 'En az kişi sayısı', 'num'], ['discount_from', 'İndirim başlangıç kişi sayısı', 'num'], ['discount_pct', 'İndirim yüzdesi', 'num'], ['vat_pct', 'KDV yüzdesi', 'num']];
  const TB = {
    settings: { label: 'Genel Ayarlar' },
    categories: { label: 'Kategoriler', f: [['name', 'Kategori adı'], ['icon', 'Simge (emoji)'], ['max_select', 'En fazla seçim (0 = sınırsız)', 'num'], ['sort', 'Sıra', 'num']] },
    dishes: { label: 'Yemekler & Fiyatlar', f: [['name', 'Yemek adı'], ['category_id', 'Kategori', 'cat'], ['description', 'Açıklama', 'ta'], ['price', 'Kişi başı fiyat (₺)', 'num'], ['image_url', 'Fotoğraf', 'img'], ['active', 'Sitede göster', 'chk'], ['sort', 'Sıra', 'num']] },
    services: { label: 'Hizmetler', f: [['icon', 'Simge (emoji)'], ['title', 'Başlık'], ['text', 'Açıklama', 'ta'], ['sort', 'Sıra', 'num']] },
    gallery: { label: 'Galeri', f: [['caption', 'Alt yazı'], ['image_url', 'Fotoğraf', 'img'], ['sort', 'Sıra', 'num']] },
    why_us: { label: 'Neden Biz', f: [['title', 'Başlık'], ['text', 'Açıklama', 'ta'], ['sort', 'Sıra', 'num']] },
    reviews: { label: 'Yorumlar', f: [['name', 'Müşteri adı'], ['text', 'Yorum', 'ta'], ['sort', 'Sıra', 'num']] },
    faq: { label: 'SSS', f: [['question', 'Soru'], ['answer', 'Cevap', 'ta'], ['sort', 'Sıra', 'num']] },
    quotes: { label: 'Teklif Talepleri' },
  };
  const STATUS = ['yeni', 'görüşüldü', 'teklif verildi', 'onaylandı', 'iptal'];

  async function api(path, body) {
    const r = await fetch(path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
    let j = {}; try { j = await r.json(); } catch (e) { /* boş yanıt */ }
    if (r.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error('Oturum süresi doldu, tekrar giriş yapın.'); }
    if (!r.ok) throw new Error(j.error || 'İşlem başarısız');
    return j;
  }
  function toast(m, bad) {
    const t = document.createElement('div'); t.className = 'msg' + (bad ? ' bad' : ''); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
  }

  function showLogin() {
    $('#root').innerHTML = `<div class="lg"><div class="card"><h3>Yönetim Girişi</h3><p class="sm">Devam etmek için şifrenizi girin.</p><input id="pw" type="password" placeholder="Şifre" autocomplete="current-password"><div class="er" id="le" role="alert"></div><button class="btn full" id="lb">Giriş</button></div></div>`;
    const go = async () => {
      $('#lb').disabled = true; $('#le').textContent = '';
      try { await api('/api/admin/login', { password: $('#pw').value }); await load(); }
      catch (e) { $('#le').textContent = e.message; $('#pw').value = ''; $('#lb').disabled = false; }
    };
    $('#lb').addEventListener('click', go);
    $('#pw').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $('#pw').focus();
  }

  async function load() { D = await api('/api/admin/all'); panel(); }

  function fld(t, i, [k, lb, type], o) {
    const a = `data-i="${i}" data-k="${k}"`, v = o[k];
    if (type === 'ta') return `<div><label>${lb}</label><textarea ${a}>${esc(v)}</textarea></div>`;
    if (type === 'cat') return `<div><label>${lb}</label><select ${a}>${D.categories.map((c) => `<option value="${esc(c.id)}" ${c.id === v ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>`;
    if (type === 'chk') return `<div><label><input type="checkbox" ${a} ${v ? 'checked' : ''}> ${lb}</label></div>`;
    if (type === 'img') return `<div><label>${lb}</label>${v ? `<img class="thumb" src="${esc(v)}" alt="">` : ''}<input type="file" accept="image/jpeg,image/png,image/webp" data-img="${i}" data-k="${k}">${v ? `<button class="btn o s" data-rmimg="${i}" data-k="${k}">Fotoğrafı kaldır</button>` : ''}</div>`;
    return `<div><label>${lb}</label><input ${type === 'num' ? 'type="number" step="any"' : ''} ${a} value="${esc(v)}"></div>`;
  }

  function panel() {
    let body = '';
    if (tab === 'settings') {
      body = `<div class="ai"><div class="r">${SET.map((f) => fld('settings', 0, f, D.settings)).join('')}</div><div class="acts"><button class="btn" data-savesettings="1">Ayarları Kaydet</button></div></div>`;
    } else if (tab === 'quotes') {
      body = D.quotes.length ? D.quotes.map((q, i) => {
        const by = {}; (q.items || []).forEach((x) => (by[x.category] = by[x.category] || []).push(x.name));
        return `<div class="ai"><div class="qt"><b>${esc(q.name)} · ${esc(q.people)} kişi · ${tl(q.total)}</b><small>${new Date(q.created_at).toLocaleString('tr-TR')} · #${esc(String(q.id).slice(0, 8).toUpperCase())}</small></div>
<div class="qi">📞 <a href="tel:${esc(q.phone)}">${esc(q.phone)}</a>${q.email ? ` · ✉️ <a href="mailto:${esc(q.email)}">${esc(q.email)}</a>` : ''}<br>${esc(q.event_type)}${q.event_date ? ' · ' + esc(q.event_date) : ''} · kişi başı ${tl(q.per_person)}</div>
<div class="qi">${Object.entries(by).map(([c, n]) => `<b>${esc(c)}:</b> ${n.map(esc).join(', ')}`).join('<br>')}</div>${q.note ? `<div class="qi"><i>Not: ${esc(q.note)}</i></div>` : ''}
<div class="acts"><select data-qs="${i}" style="width:auto">${STATUS.map((s) => `<option ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}</select><button class="btn o s" data-del="${i}">Sil</button></div></div>`;
      }).join('') : '<p class="empty">Henüz teklif talebi yok.</p>';
    } else {
      body = D[tab].map((o, i) => `<div class="ai"><div class="r">${TB[tab].f.map((f) => fld(tab, i, f, o)).join('')}</div><div class="acts"><button class="btn s" data-save="${i}">Kaydet</button><button class="btn o s" data-del="${i}">Sil</button></div></div>`).join('') + `<button class="btn" data-add="1">+ Yeni Ekle</button>`;
    }
    $('#root').innerHTML = `<div class="ah"><b>Site Yönetimi</b><span><a class="btn o s" href="/" target="_blank" rel="noopener">Siteyi Gör</a> <button class="btn o s" id="lo">Çıkış</button></span></div>
<div class="w" style="padding-top:20px;padding-bottom:60px"><div class="tabs">${Object.keys(TB).map((k) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${TB[k].label}${k === 'quotes' && D.quotes.filter((q) => q.status === 'yeni').length ? `<i>${D.quotes.filter((q) => q.status === 'yeni').length}</i>` : ''}</button>`).join('')}</div>${body}</div>`;
  }

  const keep = (fn) => { const y = window.scrollY; fn(); window.scrollTo(0, y); };
  function shrink(f) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onerror = () => rej(new Error('Dosya okunamadı'));
      r.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error('Geçerli bir görsel seçin'));
        im.onload = () => {
          const s = Math.min(1, 1200 / Math.max(im.width, im.height)), c = document.createElement('canvas');
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  const rows = () => (tab === 'settings' ? [D.settings] : D[tab]);

  document.addEventListener('input', (e) => {
    const t = e.target, d = t.dataset;
    if (d.k === undefined || d.img !== undefined || t.type === 'file' || t.type === 'checkbox' || !D) return;
    rows()[d.i || 0][d.k] = t.value;
  });
  document.addEventListener('change', async (e) => {
    const t = e.target, d = t.dataset;
    if (!D) return;
    try {
      if (d.qs !== undefined) { const q = D.quotes[d.qs]; await api('/api/admin/item', { table: 'quotes', action: 'save', row: { id: q.id, status: t.value } }); q.status = t.value; toast('Durum güncellendi'); keep(panel); return; }
      if (d.img !== undefined && t.files[0]) {
        toast('Fotoğraf yükleniyor…');
        const j = await api('/api/admin/upload', { dataUrl: await shrink(t.files[0]) });
        rows()[d.img || 0][d.k] = j.url; toast('Fotoğraf yüklendi. Kaydetmeyi unutmayın.'); keep(panel); return;
      }
      if (d.k !== undefined && t.type === 'checkbox') rows()[d.i || 0][d.k] = t.checked;
      else if (d.k !== undefined && t.tagName === 'SELECT') rows()[d.i || 0][d.k] = t.value;
    } catch (err) { toast(err.message, true); }
  });
  document.addEventListener('click', async (e) => {
    const d = e.target.dataset;
    if (e.target.id === 'lo') { await api('/api/admin/logout', {}); D = null; showLogin(); return; }
    if (!D) return;
    try {
      if (d.tab) { tab = d.tab; panel(); window.scrollTo(0, 0); }
      else if (d.rmimg !== undefined) { rows()[d.rmimg || 0][d.k] = ''; keep(panel); }
      else if (d.add) {
        const o = { sort: D[tab].reduce((m, x) => Math.max(m, Number(x.sort) || 0), 0) + 1 };
        if (tab === 'categories') Object.assign(o, { icon: '🍽️', max_select: 1 });
        if (tab === 'dishes') Object.assign(o, { category_id: D.categories[0]?.id, price: 0, active: true });
        if (tab === 'services') o.icon = '🍽️';
        D[tab].push(o); panel(); window.scrollTo(0, document.body.scrollHeight);
      } else if (d.save !== undefined) {
        const o = D[tab][d.save];
        const j = await api('/api/admin/item', { table: tab, action: 'save', row: o });
        D[tab][d.save] = j.row; toast('Kaydedildi'); keep(panel);
      } else if (d.del !== undefined) {
        const o = D[tab][d.del];
        if (!o.id) { D[tab].splice(d.del, 1); keep(panel); return; }
        if (!confirm(tab === 'categories' ? 'Bu kategori ve içindeki TÜM yemekler silinsin mi?' : 'Silinsin mi?')) return;
        await api('/api/admin/item', { table: tab, action: 'delete', id: o.id });
        D[tab].splice(d.del, 1);
        if (tab === 'categories') D.dishes = D.dishes.filter((x) => x.category_id !== o.id);
        toast('Silindi'); keep(panel);
      } else if (d.savesettings) {
        await api('/api/admin/settings', { values: D.settings }); toast('Ayarlar kaydedildi');
      }
    } catch (err) { toast(err.message, true); }
  });

  api('/api/admin/all').then((j) => { D = j; panel(); }).catch(() => showLogin());
})();
