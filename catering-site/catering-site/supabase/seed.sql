-- İSTEĞE BAĞLI: örnek içerik. schema.sql'den SONRA, bir kez çalıştırın.
-- Tüm metin, fiyat, telefon ve yorumlar ÖRNEKTİR; yönetim panelinden kendi bilgilerinizle değiştirin.

insert into settings (key, value) values
 ('brand','Altın Sofra'),
 ('slogan','İstanbul’da Catering ve Davet Organizasyonu'),
 ('hero_sub','Kurumsal etkinlik, davet ve toplu yemek organizasyonlarınız için menü, servis ekibi ve ekipman tek elden. Kendi menünüzü seçin, fiyatı anında görün.'),
 ('hero_image',''),
 ('about','2009’dan beri İstanbul’da kurumsal ve bireysel etkinliklere catering hizmeti veriyoruz. Menü planlama, üretim, taşıma, kurulum, servis ve toplama aynı ekip tarafından yürütülür.'),
 ('years','2009'),('districts','39'),
 ('phone','0212 000 00 00'),('whatsapp','905320000000'),('email','info@altinsofra.com'),
 ('address','Şişli / İstanbul'),('hours','Hafta içi 09:00–18:00 · Cumartesi 09:00–14:00'),
 ('min_people','20'),('discount_from','100'),('discount_pct','5'),('vat_pct','10')
on conflict (key) do nothing;

insert into categories (name, icon, max_select, sort) values
 ('Ana Yemek','🍖',2,1),('Çorba','🥣',1,2),('Pilav','🍚',1,3),('Salata','🥗',2,4),('Cacık','🥒',1,5);

insert into dishes (category_id, name, description, price, sort)
select c.id, v.name, v.d, v.p, v.s
from (values
 ('Ana Yemek','Fırın Kuzu Tandır','Yavaş pişmiş, kemikten ayrılan kuzu eti.',210,1),
 ('Ana Yemek','Izgara Tavuk Şiş','Özel marinasyonlu tavuk, közlenmiş sebze ile.',135,2),
 ('Ana Yemek','İzmir Köfte','Patates ve biberle fırınlanmış köfte.',150,3),
 ('Ana Yemek','Karnıyarık','Kıymalı klasik patlıcan yemeği.',120,4),
 ('Çorba','Mercimek Çorbası','Limon ve kruton eşliğinde.',35,1),
 ('Çorba','Ezogelin Çorbası','Baharatlı, yoğun kıvamlı klasik çorba.',35,2),
 ('Çorba','Domates Çorbası','Taze kaşar ile servis edilir.',38,3),
 ('Pilav','Şehriyeli Pilav','Tereyağlı, tane tane.',40,1),
 ('Pilav','İç Pilav','Kuş üzümlü ve fıstıklı.',55,2),
 ('Pilav','Bulgur Pilavı','Domatesli, sebzeli.',38,3),
 ('Salata','Çoban Salata','Mevsim sebzeleri, nar ekşisi.',35,1),
 ('Salata','Gavurdağı Salatası','Cevizli, nar ekşili.',45,2),
 ('Salata','Kinoa Salatası','Hafif ve doyurucu.',50,3),
 ('Cacık','Klasik Cacık','Yoğurt, salatalık, nane.',28,1),
 ('Cacık','Havuç Tarator','Cevizli, sarımsaklı yoğurtlu.',32,2)
) as v(cat, name, d, p, s)
join categories c on c.name = v.cat;

insert into services (icon, title, text, sort) values
 ('🏢','Kurumsal Catering','Toplantı, eğitim ve ofis etkinlikleri için ikram.',1),
 ('💍','Davet Organizasyonu','Düğün, nişan ve yıl sonu davetleri için set menü veya büfe.',2),
 ('🍱','Toplu Yemek','Fabrika, ofis ve okullar için günlük yemek hizmeti.',3);

insert into why_us (title, text, sort) values
 ('Yıllarca tecrübe','İstanbul’da yüzlerce organizasyonda edinilmiş deneyim.',1),
 ('Tek elden organizasyon','Menü, servis, ekipman, kurulum ve toplama aynı ekipte.',2),
 ('Esnek menü','Kendi menünüzü kurun, bütçenize göre ayarlayın.',3),
 ('Hijyen ve kalite','Gıda güvenliği standartlarına uygun üretim ve servis.',4);

insert into gallery (caption, sort) values
 ('Kurumsal davet',1),('Açık büfe',2),('Tatlı sunumu',3),('Servis ekibi',4);

insert into reviews (name, text, sort) values
 ('Örnek Müşteri 1','Bu yorumu yönetim panelinden gerçek müşteri yorumuyla değiştirin.',1);

insert into faq (question, answer, sort) values
 ('En az kaç kişilik organizasyon alıyorsunuz?','Menü oluşturucuda belirtilen asgari kişi sayısından itibaren hizmet veriyoruz; üst sınır yoktur.',1),
 ('Fiyatlar nasıl hesaplanır?','Seçtiğiniz yemeklerin kişi başı fiyatları toplanır ve kişi sayısıyla çarpılır. Servis, ekipman ve nakliye teklifte ayrıca netleşir.',2),
 ('Ne kadar önceden haber vermeliyim?','Etkinlikten en az bir hafta önce talep iletmenizi öneririz.',3);
