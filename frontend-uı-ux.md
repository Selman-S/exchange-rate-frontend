
# 1) Bilgi Mimarisi & Ekranlar

## 1.1. Global

* **Header** : logo, sayfa başlığı, tarih aralığı seçici (global filtre), arama (emtia/portföy), kullanıcı menüsü (profil/çıkış).
* **Sol Sidebar** (masaüstü): “Piyasa”, “Portföylerim”, “Raporlar/İhracat”, “Ayarlar”.
* **Mobil** : altta 4’lü tab bar (Piyasa, Portföyler, Rapor, Ayarlar).

## 1.2. Piyasa (Market Overview)

* **Fiyat kartları** (grid): listedeki tüm altın & döviz enstrümanları.
  * Kart içi: Enstrüman adı, son fiyat (TL), **günlük değişim** (mutlak & %), mini sparkline (7 gün).
  * Favoriye ekle/çıkar (⭐).
* **Filtreler** : Tür (Altın/Döviz), favoriler, alfabetik, son 24s/7g/1a performans.
* **Detay drawer** (tıklayınca sağdan açılan panel):
  * Seçili enstrüman için: büyük **zaman serisi grafiği** (TL), tarih aralığı: 1H/1G/1Hf/1A/5A/Maks.
  * İstatistikler: ATH/ATL (seçili aralık), volatilite (standart sapma), basit hareketli ort. (ops.).

## 1.3. Portföylerim (Liste)

* **Portföy kartları** :
* İsim, son değer (TL), günlük/aylık değişim (%/₺), toplam kar/zarar, varlık sayısı.
* “Detaya Git”, “Yeniden Adlandır”, “Sil”.
* **Yeni Portföy Oluştur** (modal): ad (zorunlu, 3–40 karakter, benzersiz), açıklama (ops.).

## 1.4. Portföy Detayı

* **Üst özet** : Toplam değer (TL), günlük değişim (%/₺), başlangıçtan beri getiri, nakit (varsa).
* **Grafik 1 – Portföy Değeri Zaman Serisi** :
* Line chart; y: TL; x: tarih;  **tooltips** : tarih, değer, günlük değişim.
* Zaman aralığı: 1A/3A/6A/1Y/5Y/Maks +  **özel tarih seçici** .
* **Grafik 2 – Dağılım (Donut/Pie)** :
* Altın vs Döviz vs (varsa) Nakit yüzdeleri.
* Dilim üzerine gelince enstrüman ve tutar.
* **Performans Tablosu** :
* Sütunlar: Enstrüman, Miktar & Birim, Ortalama Maliyet (TL), Mevcut Fiyat (TL), Mevcut Değer (TL), Gerçekleşmemiş P/L (₺, %), Portföy Payı %.
* Sıralama & filtre (Altın/Döviz).
* **İşlemler Tablosu** :
* Sütunlar: Tarih, Enstrüman, İşlem (Al/Sat), Miktar & Birim, Fiyat (TL – otomatik), Toplam Tutar (TL), Not/Etiket.
* İndir (CSV/XLSX), sayfalandırma, arama.
* **Hızlı Aksiyonlar** :
* “İşlem Ekle” (modal), “Dışa Aktar” (CSV/PDF), “Uyarı Oluştur” (fiyat seviyesi).

## 1.5. İşlem Ekle Modalı

* **Alanlar** :
* Tür: **Altın** | **Döviz** (radio).
* Enstrüman: (autocomplete – yalnızca listeden seçim).
* İşlem Türü: Al | Sat.
* **Geçmiş Tarih** : datepicker (zorunlu).
  * Kısıt: bugün ≤; 25 yıllık veri aralığı içinde olmalı.
* Miktar: numerik + birim (gram, adet, “para birimi” için tutar).
* **Fiyat (TL)** : **otomatik doldur** (seçilen tarihteki kapanış/eod); kullanıcı isterse **manuel override** (onay uyarısı ile).
* Not/Etiket: opsiyonel.
* **Validasyon & UX** :
* Eksik/uygunsuz alan için inline hata.
* Tarihte veri yoksa: “Seçilen tarihte veri bulunamadı, en yakın tarih: dd.mm.yyyy – bu fiyatı kullanmak ister misiniz?” (tek tıkla doldur).
* **Kayıt sonrası** : başarı bildirimi + işlemi görsel highlight ile tablonun en üstünde göster.

## 1.6. Raporlar & İhracat

* **Dönemsel performans** : seçili aralık için toplam getiri (TL/%), günlük getiriler tablosu.
* **Karşılaştırma** : Portföy vs USD/EUR/Gram Altın benchmark çizgileri.
* **İhracat** :
* CSV/XLSX: işlemler, günlük portföy değeri, enstrüman bazlı özet.
* PDF: özet rapor + grafikleri (A4 dikey, başlık/tarih aralığı alt bilgisi).

## 1.7. Ayarlar

* Para formatı (₺), sayı gösterimi, tarih biçimi (dd.mm.yyyy), **zaman dilimi: Europe/Istanbul** sabit.
* Varsayılan tarih aralığı, tema (koyu/açık), email bildirim tercihleri.

# 2) Bileşen Kataloğu (Reusable Components)

* **PriceCard** (name, code, lastTL, changeAbs, changePct, sparkData, favorite, onToggleFav)
* **TimeRangePicker** (preset, customFrom, customTo, onChange)
* **InstrumentSelect** (type: Altın|Döviz, list, search, onSelect)
* **PortfolioValueChart** (series[{date, valueTL}], markers, onBrush)
* **AllocationDonut** (items[{label, valueTL}])
* **PerformanceTable** (rows, sort, filters)
* **TransactionsTable** (rows, pagination, export)
* **AddTransactionModal** (onSubmit, onValidate, priceAuto, allowManualPrice)
* **EmptyState** (title, desc, actionLabel, onAction)
* **Toast/InlineAlert** (type: success|warning|error)
* **ConfirmDialog** (title, desc, onConfirm)

# 3) Akışlar (User Flows)

## 3.1. Portföy Oluşturma

1. “Yeni Portföy” → Ad gir → (benzersizlik kontrolü) → Oluştur → Portföy Detayına yönlen.

   **Done kriteri** : Benzersiz ad, boş durumda “İşlem Ekle” CTA + boş durum açıklaması.

## 3.2. İşlem Ekleme (Geçmiş Tarihli)

1. Portföy Detay → “İşlem Ekle” → Tür/Enstrüman/Tarih/Miktar → Fiyat otomatik gelir.
2. Veri yoksa  **yakın tarihe öneri** .
3. Kaydet → tabloda görünsün, grafikler anında güncellensin.

   **Done** : optimistic UI (bekleme hissi yok), undo 5 sn (ops.).

## 3.3. Zaman Aralığı İncelemesi

* Üstteki tarih aralığı değişince **bütün kartlar/grafikler senkron** güncellenir.
* Grafikte brush ile aralık seçince TimeRangePicker da güncellenir.

  **Done** : tek kaynaklı gerçeklik – aralık tüm alt bileşenleri tetikler.

# 4) Doğrulama Kuralları & Edge Case’ler

* **Tarih** : min/max veri tarihi aralığı; gelecek tarih yasak. Resmi tatilde veri yoksa en yakın iş günü.
* **Miktar** : >0; altın için gram/adet, döviz için tutar.
* **Fiyat** : otomatik TL; manuel değişimde “kendi fiyatımı kullan” toggle + uyarı metni.
* **Silme/Geri Alma** : işlem silme → portföy yeniden hesaplanır.
* **Boş Durumlar** : hiçbir portföy yoksa yönlendirici onboarding.
* **Hata** : ağ hatası (retry), veri yok, yetkisiz (401 → login’e yönlendir).
* **Saat dilimi** : tüm tarih damgaları **Europe/Istanbul** gün kapanışına göre.

# 5) Erişilebilirlik (A11y) & i18n

* Klavye ile tam gezinme (Tab/Shift+Tab, Enter, Space), odak halkaları.
* Kontrast ≥ WCAG AA.
* Ekran okuyucu için ARIA label’ları (grafiklerde de açıklayıcı başlıklar).
* Dil: Türkçe; sayılarda **binlik ayraç** ve TL işareti; tarih dd.mm.yyyy.

# 6) Performans & Teknik UI Notları

* **Tablo sanallaştırma** (10k+ işlemde akıcı scroll).
* **Debounce** arama (300ms).
* **Grafik** : tek seri line + alan doldurma (ops.), responsive; tooltipte TL format.
* **Skeleton** yüklemeler, **lazy-load** detay paneller.
* **Hafıza** : seçili tarih aralığı ve filtreleri route state / URL query’de tut (paylaşılabilir link).

# 7) Görselleştirme Spesifikasyonları

* **Portföy Değeri** : line chart; eksik günler **interpolate etme** (çizgi kırık kalmasın), noktada tooltipte: Tarih, Değer TL, Günlük Değişim (₺/%).
* **Dağılım** : donut; dilimde TL + %.
* **Benchmark** (opsiyonel): ikinci eksen gerekmeden aynı ölçekte USD/EUR/Gram Altın referans serileri (normalize=100).

# 8) Frontend–Backend Arayüz (Örnek Sözleşmeler)

> Backend’in hazır olduğunu biliyorum; yine de FE için beklenti netliği adına örnek payload’lar:

* **GET** `/api/market/instruments?type=gold|fx`

  **200** : `{ items: [{ id, name, type, code }] }`
* **GET** `/api/market/price-series?code=USDTRY&from=YYYY-MM-DD&to=YYYY-MM-DD`

  **200** : `{ code, currency: "TRY", series: [{ date: "2024-01-01", close: 29.87 }, ...] }`
* **POST** `/api/portfolios`

  **body** : `{ name, description? }` →  **201** : `{ id, name }`
* **GET** `/api/portfolios` → liste
* **GET** `/api/portfolios/{id}` → özet, kompozisyon

  **200** : `{ id, name, summary: { valueTL, pnlAbs, pnlPct }, allocation: [{ code, valueTL }], period: { from, to } }`
* **GET** `/api/portfolios/{id}/value-series?from&to`

  **200** : `{ series: [{ date, valueTL }], benchmarks?: { USDTRY?:[], EURTRY?:[], XAUTRY?:[] } }`
* **GET** `/api/portfolios/{id}/positions`

  **200** : `{ items: [{ code, name, amount, unit, avgCostTL, lastTL, valueTL, pnlAbs, pnlPct, sharePct }] }`
* **GET** `/api/portfolios/{id}/transactions?search=&page=&pageSize=`

  **200** : `{ items: [{ id, date, side:"BUY|SELL", code, amount, unit, priceTL, totalTL, note }], total }`
* **POST** `/api/portfolios/{id}/transactions`

  **body** : `{ date, side, code, amount, unit, priceTL?, priceMode:"AUTO|MANUAL", note? }`
* **GET** `/api/market/price-at?code=USDTRY&date=YYYY-MM-DD`

  **200** : `{ code, dateUsed: "YYYY-MM-DD", closeTL }` *(yakın tarih seçimi varsa `dateUsed` döner).*

> FE tarafta tüm paralar **TL** olarak gösterilecek; birim & miktar alanları enstrümana göre değişir (altın: gram/adet, döviz: tutar).

# 9) Hata & Boş Durum Metinleri (örn.)

* Piyasa kartları: “Veri getirilemedi. Yeniden dene.”
* Portföy boş: “Henüz işlemin yok. İlk işlemini ekleyerek başla.”
* Fiyat bulunamadı: “Seçilen tarihte fiyat yok. dd.mm.yyyy tarihli fiyatı kullanmak ister misin?”

# 10) Güvenlik & Durum Yönetimi (FE Perspektifi)

* Login hazır; FE tarafında  **token yenileme** , 401 yakalama → login’e yönlendirme.
* CSRF koruması (gerekiyorsa).
* Durum yön. için **query cache** (RTK Query / React Query) + normalizasyon.
* URL tabanlı durum: `?from=2023-01-01&to=2024-12-31&portfolio=xyz`.

# 11) Test Edilebilir “Done” Kriterleri (Acceptance)

* [ ] Fiyat kartları doğru format & doğru yön (artı/eksi renkleri).
* [ ] Portföy oluşturma, ad benzersiz kontrolü, anında yönlendirme.
* [ ] İşlem ekleme: tarih kısıtları, otomatik fiyat, manuel override uyarısı.
* [ ] Değer grafiği seçilen tarih aralığına **tüm** bileşenlerle senkron.
* [ ] Performans tablosu P/L hesapları doğru (2 ondalık), TL format.
* [ ] Eksik veri gününde “yakın tarih” fallback akışı.
* [ ] CSV/XLSX/PDF ihracatları doğru başlık ve tarih aralığı içerir.
* [ ] Mobil: 360px’e kadar sorunsuz; grafik pan/zoom/tooltip çalışır.
* [ ] A11y: klavye navigasyonu; kontrast ve ARIA doğrulandı.

# 12) Görsel Stil (tasarım yönergesi – kısa)

* Tipografi: net bir sans (ör. Inter), başlık/hiyerarşi tutarlı.
* Renk: nötr zemin,  **kazanç yeşil / kayıp kırmızı** ; renk körlüğüne uygun ton farkı.
* Kartlar: yumuşak gölge, hover’da hafif yükselme; ikonografi minimal.
* Grafikler: tek seri çizgi + noktada belirgin tooltip; grid çizgileri hafif.
