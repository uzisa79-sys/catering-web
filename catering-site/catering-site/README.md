# Altın Sofra Catering – Web Sitesi + Yönetim Paneli

Vercel'de yayınlanan, Supabase (PostgreSQL + Storage) kullanan kurumsal catering sitesi.

**Özellikler**
- Kurumsal ana sayfa: hizmetler, neden biz, süreç, galeri, yorumlar, SSS, iletişim, WhatsApp butonu
- **Menü oluşturucu**: müşteri ana yemek / çorba / pilav / salata / cacık seçer, kişi sayısına göre fiyat otomatik hesaplanır (indirim + KDV dahil)
- **Teklif sistemi**: talepler veritabanına kaydedilir; fiyat sunucuda yeniden hesaplanır (istemciye güvenilmez)
- **Gizli yönetim paneli** (`/yonetim`, şifreli): yemekler, fiyatlar, fotoğraflar, kategoriler, hizmetler, galeri, yorumlar, SSS, genel ayarlar, gelen teklifler
- Panelde yapılan her değişiklik siteye en geç ~10 saniyede yansır

## Klasör yapısı
```
api/                 Vercel sunucusuz fonksiyonları (backend)
  content.js           herkese açık içerik
  quote.js             teklif talebi (doğrulama + fiyat hesabı + kayıt)
  admin/               login, logout, all, item, settings, upload (şifre gerektirir)
lib/common.js        Supabase istemcisi, oturum, ortak fonksiyonlar
public/              statik site (index.html, css/, js/, assets/, yonetim/)
supabase/schema.sql  tablolar + güvenlik + fotoğraf klasörü
supabase/seed.sql    (isteğe bağlı) örnek içerik
vercel.json          yayın ve güvenlik başlıkları
.env.example         ortam değişkenleri şablonu
```

## 1) Supabase kurulumu
1. https://supabase.com adresinde ücretsiz hesap açın → **New project** (bölge: Frankfurt/Europe önerilir).
2. Sol menü **SQL Editor → New query**: `supabase/schema.sql` dosyasının tamamını yapıştırıp **Run**.
3. (İsteğe bağlı) aynı şekilde `supabase/seed.sql` dosyasını çalıştırın → örnek menü gelir. Boş başlamak isterseniz atlayın.
4. **Project Settings → API** sayfasından iki değeri kopyalayın:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** (secret) anahtarı → `SUPABASE_SERVICE_ROLE_KEY`
5. **Storage** sayfasında `images` adlı (Public) bir bucket görmelisiniz; `schema.sql` onu otomatik oluşturur.

> `service_role` anahtarı çok güçlüdür. Sadece Vercel ortam değişkenine yazın; koda, GitHub'a veya tarayıcıya asla koymayın.

## 2) Ortam değişkenleri
| Değişken | Açıklama |
|---|---|
| `SUPABASE_URL` | Supabase Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role anahtarı |
| `ADMIN_PASSWORD` | `/yonetim` giriş şifresi (en az 10 karakter, güçlü olsun) |
| `ADMIN_SESSION_SECRET` | Oturum imza anahtarı, rastgele ≥32 karakter. Üretmek için: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

## 3) Vercel'de yayınlama (GitHub ile)
1. ZIP'i açın. https://github.com'da yeni bir **private** depo oluşturup klasörün içeriğini yükleyin (`.env` dosyası yüklemeyin; `.gitignore` bunu zaten engeller).
2. https://vercel.com → **Add New… → Project** → GitHub deponuzu seçip **Import**.
3. **Framework Preset: Other**. Build/Output ayarlarına dokunmayın (`vercel.json` zaten `public` klasörünü yayınlar).
4. **Environment Variables** bölümüne yukarıdaki 4 değişkeni ekleyin (Production, Preview, Development hepsi seçili).
5. **Deploy**'a basın. 1-2 dakika sonra `https://proje-adiniz.vercel.app` adresi hazırdır.
6. Kontrol: ana sayfa açılıyor mu, menüler geliyor mu, `/yonetim` şifre soruyor mu.
7. **Kendi alan adınız**: Vercel → Project → **Settings → Domains** → alan adınızı ekleyin, gösterilen DNS kayıtlarını alan adı sağlayıcınızda tanımlayın.

### Alternatif: Vercel CLI ile
```bash
npm i -g vercel
vercel login
vercel            # ilk kurulum (soruları varsayılanla geçin)
vercel env add SUPABASE_URL           # 4 değişkenin her biri için tekrarlayın
vercel --prod
```
Ortam değişkenini sonradan değiştirirseniz projeyi yeniden deploy edin (Deployments → ⋯ → Redeploy).

## 4) Yerelde çalıştırma (isteğe bağlı)
```bash
npm install
cp .env.example .env     # değerleri doldurun
npx vercel dev           # http://localhost:3000
```

## 5) Yönetim paneli kullanımı
- Adres: `https://siteniz.com/yonetim` (sitede bu sayfaya giden hiçbir link yoktur, arama motorlarına kapalıdır).
- **Genel Ayarlar**: marka, başlık, iletişim bilgileri, WhatsApp numarası (`905xxxxxxxxx` biçiminde), asgari kişi sayısı, indirim ve KDV oranı.
- **Kategoriler**: ad, simge, "en fazla seçim" (menü oluşturucudaki sınır; 0 = sınırsız). Kategori silinirse içindeki yemekler de silinir.
- **Yemekler & Fiyatlar**: ad, kategori, açıklama, **kişi başı fiyat**, fotoğraf, "sitede göster". Her kartta ayrı **Kaydet** düğmesi vardır.
- **Galeri / Hizmetler / Neden Biz / Yorumlar / SSS**: ekle, düzenle, sil.
- **Teklif Talepleri**: gelen talepler (müşteri, menü, toplam, not); durumu güncelleyin (yeni → görüşüldü → …).
- Fotoğraflar yüklenirken otomatik küçültülür ve Supabase Storage'a yazılır.

## Güvenlik notları
- Tablolarda RLS açık ve politika yok: veriye tarayıcıdan doğrudan erişilemez, yalnızca Vercel fonksiyonları (service_role) erişir.
- Yönetici oturumu HttpOnly + SameSite=Strict çerezle tutulur, 8 saat geçerlidir. 5 hatalı şifrede 15 dakika bekleme uygulanır (sunucusuz ortamda "en iyi çaba" sınırlaması).
- Teklif formunda gizli bot tuzağı ve sunucu tarafı doğrulama vardır.
- Teklifler yalnızca veritabanına kaydedilir; e-posta bildirimi gönderilmez. Yeni talepleri panelde "Teklif Talepleri" sekmesinden takip edin.
- Örnek metin, fiyat, telefon, WhatsApp ve yorum içerikleri **örnektir**; yayına almadan önce panelden değiştirin.
