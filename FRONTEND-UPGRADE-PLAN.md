# Frontend V1 Geliştirme Planı (TAMAMLANDI ✅)

> **Not:** Bu doküman Version 1'in geliştirme planıdır. **V1 tamamlanmıştır.**  
> **Version 2 planı için:** `V2-FRONTEND-PLAN.md` dosyasına bakınız.

## 📋 İçindekiler
1. [Backend API Uyumluluk Analizi](#backend-api-uyumluluk-analizi)
2. [Gerekli Backend Değişiklikleri](#gerekli-backend-değişiklikleri)
3. [Frontend Geliştirme Fazları](#frontend-geliştirme-fazları)
4. [Detaylı Görev Listesi](#detaylı-görev-listesi)
5. [Teknik Stack & Yeni Kütüphaneler](#teknik-stack--yeni-kütüphaneler)
6. [Dizin Yapısı](#dizin-yapısı)

---

## 🔍 Backend API Uyumluluk Analizi

### ✅ Mevcut ve Kullanılabilir API'ler

| API Endpoint | Metod | Durum | Kullanım Alanı |
|--------------|-------|-------|----------------|
| `/api/rates` | GET | ✅ Hazır | Fiyat listesi, sparkline, grafikler |
| `/api/rates/names` | GET | ✅ Hazır | Varlık seçici dropdown'ları |
| `/api/portfolios` | GET | ✅ Hazır | Portföy listesi |
| `/api/portfolios/:id` | GET | ✅ Hazır | Portföy detayı |
| `/api/portfolios/:id/assets` | GET | ✅ Hazır | Varlık listesi |
| `/api/portfolios/:id/assets` | POST | ⚠️ Kısmi | Varlık ekleme (sadece güncel fiyat) |
| `/api/auth/login` | POST | ✅ Hazır | Kullanıcı girişi |
| `/api/auth/register` | POST | ✅ Hazır | Kullanıcı kaydı |

### ⚠️ Kısmi Kullanılabilir / Geliştirilmesi Gereken API'ler

| Özellik | Mevcut Durum | Sorun | Çözüm |
|---------|--------------|-------|-------|
| **Tarihli fiyat sorgulama** | `/api/rates?startDate=X&endDate=Y` | ✅ Çalışıyor | Direkt kullanılabilir |
| **Geçmiş tarihli varlık ekleme** | `POST /api/portfolios/:id/assets` | ❌ `purchaseDate` ve `costPrice` manuel girilemiyor | Backend'de `purchaseDate` ve `costPrice` optional yapılmalı |
| **Portföy özeti** | `GET /api/portfolios/:id` | ⚠️ Sadece isim ve tarih dönüyor | Summary data yok (toplam değer, kar/zarar) |

### ❌ Eksik API'ler - Backend Geliştirme Gerekli

| Özellik | İhtiyaç | Öncelik | Backend Efor |
|---------|---------|---------|--------------|
| **Favorileme sistemi** | Kullanıcı bazlı favori varlıklar | 🟡 Orta | Yeni model + endpoint |
| **Portföy değer zaman serisi** | `GET /api/portfolios/:id/value-series?from=X&to=Y` | 🔴 Yüksek | Orta (hesaplama gerekli) |
| **Portföy özeti** | `GET /api/portfolios/:id/summary` | 🔴 Yüksek | Düşük (mevcut verilerle hesaplanabilir) |
| **Benchmark data** | USD/EUR/Altın referans serileri | 🟢 Düşük | Düşük (mevcut rates'den türetilebilir) |
| **Transaction log** | İşlem geçmişi (Al/Sat) | 🔴 Yüksek | Yüksek (yeni model gerekli) |
| **İstatistikler** | ATH/ATL, volatilite hesaplamaları | 🟡 Orta | Orta (hesaplama gerekli) |

---

## 🔧 Gerekli Backend Değişiklikleri

### 1. **Kritik - Hemen Yapılmalı** 🔴

#### 1.1. Asset Model & Controller Güncellemesi
**Dosya:** `models/Asset.js`, `controllers/assetController.js`

**Değişiklik:**
```javascript
// Asset.js
purchaseDate: {
  type: Date,
  default: Date.now, // Opsiyonel yap
},
costPrice: {
  type: Number,
  // Manuel girişe izin ver veya otomatik hesapla
}

// assetController.js - createAsset fonksiyonu
// Body'den purchaseDate ve costPrice kabul et
// Eğer verilmemişse otomatik doldur
```

**Amaç:** Geçmiş tarihli işlem ekleme

---

#### 1.2. Yeni Endpoint: Belirli Tarihteki Fiyat
**Dosya:** `controllers/rateController.js`, `routes/rateRoutes.js`

```javascript
// GET /api/rates/price-at?type=gold&name=Gram+Altın&date=2024-01-15

exports.getPriceAtDate = async (req, res) => {
  const { type, name, date } = req.query;
  
  // İlgili tarihte veya en yakın tarihteki fiyatı bul
  const rate = await Rate.findOne({
    type,
    name,
    date: { $lte: new Date(date) }
  }).sort({ date: -1 });
  
  return res.json({
    success: true,
    data: {
      name,
      type,
      requestedDate: date,
      actualDate: rate.date,
      buyPrice: rate.buyPrice,
      sellPrice: rate.sellPrice,
      isExactMatch: rate.date === date
    }
  });
};
```

**Amaç:** Geçmiş tarihli işlem eklerken fiyat validasyonu

---

#### 1.3. Yeni Endpoint: Portföy Özeti
**Dosya:** `controllers/portfolioController.js`, `routes/portfolioRoutes.js`

```javascript
// GET /api/portfolios/:id/summary

exports.getPortfolioSummary = async (req, res) => {
  const portfolioId = req.params.id;
  
  // 1. Tüm asset'leri al
  const assets = await Asset.find({ portfolio: portfolioId });
  
  // 2. Her asset için güncel fiyatları çek
  let totalCost = 0;
  let totalValue = 0;
  
  for (const asset of assets) {
    const currentRate = await Rate.findOne({
      type: asset.type,
      name: asset.name
    }).sort({ date: -1 });
    
    totalCost += asset.amount * asset.costPrice;
    totalValue += asset.amount * (currentRate?.buyPrice || 0);
  }
  
  const pnl = totalValue - totalCost;
  const pnlPercent = (pnl / totalCost) * 100;
  
  return res.json({
    success: true,
    data: {
      totalCost,
      totalValue,
      pnl,
      pnlPercent,
      assetCount: assets.length
    }
  });
};
```

**Amaç:** Portföy kartlarında özet bilgi gösterme

---

### 2. **Orta Öncelik - 2. Fazda Yapılabilir** 🟡

#### 2.1. Transaction Model (İşlem Geçmişi)
**Yeni Dosya:** `models/Transaction.js`

```javascript
const TransactionSchema = new mongoose.Schema({
  portfolio: { type: ObjectId, ref: 'Portfolio', required: true },
  asset: { type: ObjectId, ref: 'Asset' }, // Opsiyonel, varlık silinmişse null
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  assetType: { type: String, enum: ['gold', 'currency'], required: true },
  assetName: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true }, // İşlem anındaki fiyat
  totalValue: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String },
  priceMode: { type: String, enum: ['AUTO', 'MANUAL'], default: 'AUTO' }
}, { timestamps: true });
```

**Amaç:** İşlem geçmişi tablosu, export, analiz

---

#### 2.2. Portföy Değer Zaman Serisi
**Dosya:** `controllers/portfolioController.js`

```javascript
// GET /api/portfolios/:id/value-series?from=2024-01-01&to=2024-12-31

exports.getPortfolioValueSeries = async (req, res) => {
  // 1. Tarih aralığındaki her gün için
  // 2. O tarihteki asset'leri bul
  // 3. O tarihteki fiyatları bul
  // 4. Toplam değeri hesapla
  
  // PERFORMANS NOTU: Bu hesaplama maliyetli olabilir
  // Cache mekanizması eklenebilir
  
  return res.json({
    success: true,
    data: {
      series: [
        { date: '2024-01-01', value: 100000 },
        { date: '2024-01-02', value: 102000 },
        // ...
      ]
    }
  });
};
```

**Amaç:** Portföy değer grafiği

---

#### 2.3. Favoriler Sistemi
**Yeni Dosya:** `models/Favorite.js`

```javascript
const FavoriteSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  assetType: { type: String, enum: ['gold', 'currency'], required: true },
  assetName: { type: String, required: true }
}, { timestamps: true });

// Unique constraint: bir kullanıcı aynı varlığı bir kere favorilesin
FavoriteSchema.index({ user: 1, assetType: 1, assetName: 1 }, { unique: true });
```

**Endpoint'ler:**
- `GET /api/favorites` - Favori listesi
- `POST /api/favorites` - Favori ekle
- `DELETE /api/favorites/:id` - Favori çıkar

**Amaç:** Kullanıcı favori varlıkları

---

### 3. **Düşük Öncelik - Frontend'de Çözülebilir** 🟢

| Özellik | Backend Gerekli mi? | Frontend Çözümü |
|---------|---------------------|-----------------|
| **İstatistikler** (ATH/ATL, volatilite) | Hayır | Frontend'de hesaplanabilir |
| **Benchmark serileri** | Hayır | Mevcut rates'den USD/EUR/Altın filtrelenebilir |
| **Export (CSV/PDF)** | Hayır | Frontend'de generate edilebilir |
| **Dağılım grafiği** | Hayır | Mevcut asset verilerinden hesaplanabilir |
| **Filtreler/Sıralama** | Hayır | Frontend'de yapılabilir |

---

## 🚀 Frontend Geliştirme Fazları

### **FAZ 0: Hazırlık & Setup** ✅ TAMAMLANDI

#### Hedefler:
- [x] Yeni kütüphaneleri yükle ve konfigüre et
  - [x] @tanstack/react-query & devtools
  - [x] recharts
  - [x] date-fns, lodash, classnames
  - [x] react-responsive
- [x] Dizin yapısını oluştur
- [x] Tasarım sistemi (colors, typography, spacing) tanımla
  - [x] src/styles/theme.js
  - [x] src/styles/global.css
- [x] Global state management kurulumu (React Query)
- [x] Utility fonksiyonlar (formatters.js)
- [x] Custom hooks (useDebounce, useLocalStorage, useResponsive)

---

### **FAZ 1: Temel Altyapı & Layout** ✅ TAMAMLANDI

#### 1.1. Tasarım Sistemi & Tema
- [x] `src/styles/theme.js` - Renk paleti, tipografi, spacing
- [x] `src/styles/global.css` - Global CSS değişkenleri (+ CSS variables)
- [ ] Dark/Light theme altyapısı (Context API) - Sonraki fazlarda
- [x] Responsive breakpoint'ler

#### 1.2. Layout Componentleri
- [x] **AppHeader** (yeniden tasarlandı)
  - [x] Logo
  - [x] Arama (varlık/portföy)
  - [x] Kullanıcı menüsü (dropdown)
  - [x] Bildirimler (placeholder)
  - [x] Mobile menu toggle
- [x] **AppSidebar** (yeniden tasarlandı)
  - [x] Ana Sayfa
  - [x] Piyasa
  - [x] Portföylerim
  - [x] Raporlar
  - [x] Ayarlar
  - [x] Collapse/expand özelliği
  - [x] Responsive (mobile overlay)
- [ ] **MobileTabBar** (yeni) - Sonraki fazlarda
  - [ ] 4 tab (Piyasa, Portföyler, Rapor, Ayarlar)
  - [ ] Aktif tab indicator
- [x] **AppFooter** (basitleştirildi)
- [x] **MainLayout** wrapper (yeni)

#### 1.3. Reusable Components (Temel)
- [x] **Card** - Gölgeli, hover efektli genel kart
- [x] **Button** - Primary, secondary, danger, ghost variants
- [x] **EmptyState** - Boş durum görseli
- [x] **Loading / Skeleton** - Yükleme durumları
- [ ] **Toast / Alert** - Bildirim sistemi (Ant Design kullanılacak)

---

### **FAZ 2: Piyasa (Market) Sayfası** ✅ TAMAMLANDI

#### 2.1. Fiyat Kartları (PriceCard)
- [x] Grid layout (responsive)
- [x] Varlık adı, son fiyat (TL)
- [x] Günlük değişim (mutlak & %)
- [x] Mini sparkline (7 günlük)
  - [x] Recharts kullanarak mini line chart
- [x] Favori butonu (⭐)
  - [x] LocalStorage'da saklanıyor

#### 2.2. Filtreler
- [x] Tür filtresi (Altın / Döviz / Hepsi)
- [x] Favoriler filtresi
- [x] Arama (isim)
- [x] Sıralama (alfabetik, fiyat, değişim)
- [ ] Performance filtresi (24s/7g/1a) - Sonraki fazlarda

#### 2.3. Detay Drawer (sağdan açılan panel)
- [ ] Ant Design Drawer kullan - Sonraki fazlarda
- [ ] Seçili varlık bilgileri
- [ ] **Büyük zaman serisi grafiği**
  - [ ] Recharts Line Chart
  - [ ] API: `GET /api/rates?name=...&startDate=...&endDate=...`
  - [ ] Zaman aralığı butonları (1H/1G/1Hf/1A/5A/Maks)
  - [ ] Responsive tooltip (tarih, fiyat)
- [ ] İstatistikler (frontend'de hesapla)
  - [ ] ATH/ATL (seçili aralıkta)
  - [ ] Volatilite (standart sapma)
  - [ ] Ortalama fiyat

#### 2.4. API Entegrasyonu
- [x] `src/services/api.js` - Axios instance
- [x] `src/services/marketApi.js`
  - [x] `fetchAllRates(type, startDate, endDate)`
  - [x] `fetchRateSeries(name, type, startDate, endDate)`
  - [x] `fetchRateNames(type)`
  - [x] `fetchLatestRates(type)`
  - [x] `fetchSparklineData(type, name, days)`
- [x] React Query hooks (`useMarket.js`)
  - [x] `useRates()`
  - [x] `useLatestRates()`
  - [x] `useRateSeries()`
  - [x] `useSparklineData()`
  - [x] Cache & refetch stratejisi

---

### **FAZ 3: Portföy Listesi** ✅ TAMAMLANDI

#### 3.1. Portföy Kartları (yeniden tasarlandı)
- [x] Grid layout (responsive)
- [x] Portföy adı, ikon (FolderOpenOutlined)
- [x] **Toplam değer (TL)**
  - [x] Backend: `GET /api/portfolios/:id/summary` entegrasyonu
  - [x] Her kart için ayrı summary fetch
- [x] Günlük/aylık değişim (% ve ₺) - PNL gösterimi
- [x] Varlık sayısı
- [x] Aksiyon butonları (Dropdown menu)
  - [x] Detaya Git (Link)
  - [x] Yeniden Adlandır (modal)
  - [x] Sil (confirm dialog)

#### 3.2. Yeni Portföy Oluşturma Modal
- [x] Form validasyonu (3-40 karakter)
- [x] Benzersizlik kontrolü (Backend 409 Conflict)
- [x] Açıklama alanı (opsiyonel, 200 karakter)
- [x] Edit mode desteği
- [x] React Query mutations (create/update)

#### 3.3. Boş Durum
- [x] "Henüz portföy yok" mesajı
- [x] CTA: "İlk Portföyü Oluştur"

#### 3.4. API & Hooks
- [x] `src/services/portfolioApi.js` - 9 API fonksiyonu
- [x] `src/hooks/usePortfolio.js` - 8 React Query hook
  - [x] usePortfolios, usePortfolio, usePortfolioSummary
  - [x] useCreatePortfolio, useUpdatePortfolio, useDeletePortfolio
  - [x] usePortfolioAssets, useCreateAsset, useDeleteAsset

---

### **FAZ 4: Portföy Detayı - Bölüm 1 (Grafikler)** ✅ TAMAMLANDI

#### 4.1. Üst Özet Kartı
- [x] Toplam değer (TL) - büyük font
- [x] Maliyet, Kar/Zarar, Getiri (% ve ₺) - renkli (yeşil/kırmızı)
- [x] Varlık sayısı
- [x] Backend: Summary endpoint kullanılıyor
- [x] Responsive grid layout

#### 4.2. Portföy Değer Zaman Serisi Grafiği
- [x] Recharts Line Chart
- [x] X: tarih (aylık), Y: TL
- [x] Tooltip: tarih, değer, günlük değişim
- [x] Custom styling ve renklendirme
- [x] PerformanceLineChart component
- [x] ✨ GERÇEK VERİ: Backend'den besleniyor!
- [x] Backend: `GET /api/portfolios/:id/value-series?period=6M`
  - [x] Aylık data points
  - [x] Tarihsel asset tracking
  - [x] Değişim yüzdesi hesaplama
  - [x] Period parametresi (1M, 3M, 6M, 1Y, ALL)
- [x] Frontend: usePortfolioValueSeries hook
- [x] ✨ Zaman aralığı seçici UI - TAMAMLANDI
  - [x] PeriodSelector component
  - [x] 7 preset buton: 1H, 1A, 3A, 6A, 1Y, 3Y, Maks
  - [x] Period'a göre tarih formatı (günlük/haftalık/aylık)
  - [x] React Query auto-refetch on period change
  - [x] Card extra prop ile entegrasyon
  - [x] Responsive button group
  - [ ] Özel tarih seçici (date range picker) - İleriki fazda

#### 4.3. Dağılım Grafiği (Donut Chart)
- [x] Recharts Pie Chart (donut mode)
- [x] ✨ DETAYLI GÖSTERIM: Her varlık ayrı ayrı (Gram Altın, USD, EUR vs.)
- [x] Değere göre sıralama (büyükten küçüğe)
- [x] Hover: varlık adı, tutar ve yüzde (Custom tooltip)
- [x] 12 farklı renk paleti
- [x] Renkli legend
- [x] Frontend'de hesaplanıyor (asset'lerden)

#### 4.4. Components
- [x] PortfolioSummaryCard - Özet gösterim kartı (✨ ++ hatası düzeltildi)
- [x] DonutChart - Genel amaçlı donut chart
- [x] PerformanceLineChart - Zaman serisi grafiği (mock data)
- [x] PortfolioDetail sayfası - Modern layout
  - [x] Header (back link, title, description)
  - [x] Summary card
  - [x] Tabs (Genel Bakış, Varlıklar)
  - [x] 2 grafik (Line chart + Donut chart)
  - [x] Responsive grid (2:1 ratio on desktop)
  - [x] Responsive tasarım

---

### **FAZ 5: Portföy Detayı - Bölüm 2 (Tablolar)** ✅ TAMAMLANDI

#### 5.1. Performans Tablosu
- [x] Ant Design Table
- [x] Sütunlar (11 adet):
  - [x] Enstrüman (icon + tür tag)
  - [x] Miktar
  - [x] Ortalama Maliyet (TL)
  - [x] Mevcut Fiyat (TL) - API'den çekiliyor
  - [x] Toplam Maliyet (TL)
  - [x] Mevcut Değer (TL)
  - [x] Kar/Zarar (₺ ve %) - ✨ ++ hatası düzeltildi
  - [x] Portföy Payı %
  - [x] Alış Tarihi (purchaseDate)
  - [x] ✨ Portföye Eklenme Tarihi (createdAt)
  - [x] İşlemler (Sil butonu)
- [x] Toplam satırı (footer) - PNL özeti
- [x] Responsive (horizontal scroll: 1530px)
- [x] useLatestRates ile güncel fiyatlar
- [x] useMemo ile performans optimizasyonu

#### 5.2. Varlık Ekleme Modal
- [x] Modern form tasarımı
- [x] Varlık türü seçimi (Radio: Altın/Döviz)
- [x] Varlık adı (Searchable select)
- [x] Alış tarihi (DatePicker, max: bugün)
- [x] Miktar (InputNumber)
- [x] Fiyat modu toggle (Otomatik/Manuel)
  - [x] Otomatik: Backend'den `/api/rates/price-at` çağrısı
  - [x] Manuel: InputNumber ile kullanıcı girişi
- [x] Fiyat bilgisi gösterimi
- [x] Tarih eşleşme uyarısı
- [x] Form validasyonu
- [x] React Query mutation (useCreateAsset)
- [x] Success/Error messages

#### 5.3. İşlemler
- [x] "Varlık Ekle" butonu → Modal açar
- [x] Varlık silme (Confirm dialog)
- [x] React Query auto-refresh (mutations)
- [ ] "Dışa Aktar" dropdown (CSV/PDF) - Gelecek fazda
- [ ] İşlem geçmişi tablosu - Transaction model gerekli (Gelecek fazda)

---

### **FAZ 6: İşlem Geçmişi (Transaction Model)** ✅ TAMAMLANDI

#### 6.1. Backend API
- [x] Transaction model oluşturuldu
  - [x] Portfolio, asset, side (BUY/SELL), assetType, assetName
  - [x] amount, price, totalValue, date, note, priceMode
  - [x] Compound indexes (portfolio+date, portfolio+assetName)
  - [x] Virtuals (formattedDate, formattedTotal)
- [x] Transaction controller
  - [x] getTransactions - Listeleme, arama, filtreleme, pagination
  - [x] createTransaction - Yeni işlem ekleme
  - [x] deleteTransaction - İşlem silme
- [x] Transaction routes
  - [x] GET `/api/portfolios/:id/transactions`
  - [x] POST `/api/portfolios/:id/transactions`
  - [x] DELETE `/api/portfolios/:id/transactions/:transactionId`
  - [x] Swagger documentation
- [x] Asset controller entegrasyonu
  - [x] Asset ekleme → Otomatik BUY transaction kaydı

#### 6.2. Frontend API & Hooks
- [x] portfolioApi.js - 3 yeni fonksiyon
  - [x] fetchTransactions
  - [x] createTransaction
  - [x] deleteTransaction
- [x] usePortfolio.js - 3 yeni hook
  - [x] useTransactions
  - [x] useCreateTransaction
  - [x] useDeleteTransaction

#### 6.3. TransactionsTable Component
- [x] Ant Design Table
- [x] Sütunlar (9 adet):
  - [x] Tarih (sortable)
  - [x] İşlem Türü (BUY/SELL tag)
  - [x] Enstrüman (icon + tür tag)
  - [x] Miktar
  - [x] Fiyat (₺)
  - [x] Toplam (₺) - renkli (+ yeşil, - kırmızı)
  - [x] Fiyat Modu (AUTO/MANUAL tag)
  - [x] Not
  - [x] Oluşturma tarihi
  - [x] İşlemler (Sil butonu)
- [x] Filtreler
  - [x] Arama (enstrüman adı)
  - [x] İşlem türü filtresi (Alış/Satış)
- [x] Pagination (20 kayıt/sayfa)
- [x] Delete confirmation
- [x] Responsive (horizontal scroll: 1300px)

#### 6.4. PortfolioDetail Entegrasyonu
- [x] "İşlem Geçmişi" tab eklendi
- [x] TransactionsTable entegre edildi
- [x] Real-time update (React Query)

---

### **FAZ 7: Raporlar & Export** ✅ TAMAMLANDI

#### 7.1. Export Fonksiyonları ✅ TAMAMLANDI
- [x] **Kütüphaneler yüklendi**
  - [x] xlsx - Excel export
  - [x] react-csv (kullanılmadı, custom CSV fonksiyonu yazıldı)
- [x] **Export Utility Fonksiyonları** (`src/utils/exporters.js`)
  - [x] convertToCSV - CSV dönüşüm helper
  - [x] downloadFile - Dosya indirme helper
  - [x] exportAssetsToCSV - Varlıkları CSV'ye export
  - [x] exportAssetsToExcel - Varlıkları Excel'e export
  - [x] exportTransactionsToCSV - İşlemleri CSV'ye export
  - [x] exportTransactionsToExcel - İşlemleri Excel'e export
- [x] **PerformanceTable Export Butonları**
  - [x] Dropdown menu (CSV / Excel seçenekleri)
  - [x] Export fonksiyonları entegre
  - [x] Success/Warning messages
  - [x] Özet satırları dahil
- [x] **TransactionsTable Export Butonları**
  - [x] Dropdown menu (CSV / Excel seçenekleri)
  - [x] Export fonksiyonları entegre
  - [x] Özet hesaplamaları (Toplam Alış/Satış)
  - [x] Filtre ve arama korunuyor

#### 7.2. Raporlar Sayfası ✅ TAMAMLANDI
- [x] **ReportsPage Component** (`src/pages/Reports/ReportsPage.jsx`)
  - [x] Modern page layout
  - [x] Responsive tasarım
  - [x] Route entegrasyonu (`/reports`)
- [x] **Filtreler**
  - [x] Portföy seçici (Select)
  - [x] Tarih aralığı seçici (RangePicker)
  - [x] Custom date range desteği
- [x] **Performans Metrikleri (4 Kart)**
  - [x] Toplam Getiri (TL ve %)
  - [x] En İyi Gün (tarih + %)
  - [x] En Kötü Gün (tarih + %)
  - [x] Volatilite (günlük std. sapma)
- [x] **Portföy Değer Grafiği**
  - [x] PerformanceLineChart kullanımı
  - [x] Backend'den gerçek veri
  - [x] Custom period desteği (CUSTOM)
- [x] **Günlük Getiriler Tablosu**
  - [x] Tarih, Portföy Değeri, Günlük Değişim (TL ve %)
  - [x] Sıralama özellikleri
  - [x] Pagination (20 kayıt/sayfa)
  - [x] Renklendirme (+ yeşil, - kırmızı)
- [x] **Benchmark Bilgileri**
  - [x] USD, EUR, Gram Altın fiyatları
  - [x] Güncel rate'lerden besleniyor
- [x] **Backend API Geliştirmesi**
  - [x] CUSTOM period desteği
  - [x] startDate & endDate parametreleri
  - [x] Otomatik interval belirleme (daily/weekly/monthly)

#### Tamamlanmayan (Gelecek özellikler)
- [ ] PDF Export (jsPDF ile rapor oluşturma)
- [ ] Karşılaştırma grafiği (Portföy vs Benchmark normalize)

---

### **FAZ 8: Ayarlar & Kullanıcı Profili** ✅ TAMAMLANDI

#### 8.1. Theme Context & Dark Mode ✅
- [x] ThemeContext oluşturuldu
  - [x] LocalStorage ile persist
  - [x] Light/Dark mode toggle
  - [x] useTheme custom hook
- [x] Dark theme CSS variables
- [x] Header'a theme toggle butonu
  - [x] Ay/Güneş ikonu
  - [x] Tooltip
  - [x] Smooth animation
- [x] Ant Design dark mode override
  - [x] Table, Card, Modal
  - [x] Input, Select, DatePicker
  - [x] Button, Pagination, Tag
  - [x] Dropdown, Tabs, Form
  - [x] Message, Notification

#### 8.2. Backend API ✅
- [x] Şifre değiştirme endpoint
  - [x] `PUT /api/auth/change-password`
  - [x] Mevcut şifre doğrulama
  - [x] Yeni şifre validasyonu
  - [x] Swagger documentation
- [x] Email değiştirme endpoint
  - [x] `PUT /api/auth/change-email`
  - [x] Şifre doğrulama
  - [x] Email format kontrolü
  - [x] Unique email kontrolü
  - [x] Swagger documentation

#### 8.3. Kullanıcı Profili Sayfası ✅
- [x] ProfilePage component
- [x] Kullanıcı bilgileri görüntüleme
  - [x] Email
  - [x] Hesap oluşturma tarihi
- [x] Şifre değiştirme formu
  - [x] Mevcut şifre
  - [x] Yeni şifre
  - [x] Şifre tekrar
  - [x] Validasyon
  - [x] Success/Error messages
- [x] Email değiştirme formu
  - [x] Yeni email
  - [x] Şifre doğrulama
  - [x] Email format validasyonu
  - [x] Success/Error messages
  - [x] Context update
- [x] Modern card-based layout
- [x] Responsive tasarım

#### 8.4. Ayarlar Sayfası ✅
- [x] SettingsPage component
- [x] Tema seçimi
  - [x] Light theme option
  - [x] Dark theme option
  - [x] Radio group ile seçim
  - [x] İkonlar ve açıklamalar
  - [x] Real-time preview
- [x] Modern card-based layout
- [x] Info card (gelecek özellikler)
- [x] Responsive tasarım

#### 8.5. Route & Navigation ✅
- [x] `/profile` route eklendi
- [x] `/settings` route eklendi
- [x] Header user menu'den erişim
- [x] PrivateRoute ile korumalı

#### 8.6. Frontend API Services ✅
- [x] `changePassword` service
- [x] `changeEmail` service
- [x] AuthContext `setUser` eklendi
- [x] `useAuth` custom hook

#### Tamamlanmayan (Gelecek özellikler)
- [ ] Para formatı tercihi
- [ ] Sayı gösterimi tercihi
- [ ] Tarih formatı tercihi
- [ ] Email bildirim tercihleri
- [ ] Hesap silme

---

### **FAZ 9: Mobil Optimizasyon** ✅ TAMAMLANDI

#### 9.1. Global CSS Mobil Optimizasyonlar ✅
- [x] **Touch Target Minimum Boyut** (44x44px)
  - [x] Button, Input, Select'ler için min-height
  - [x] Erişilebilirlik standardına uyum
- [x] **Responsive Breakpoints** (768px, 576px)
  - [x] Tablet ve mobile için ayrı kurallar
  - [x] Font boyutları optimize edildi
- [x] **Card & Padding Optimizasyonları**
  - [x] Mobile'da daha kompakt padding
  - [x] Card margin'ler ayarlandı
- [x] **Table Scroll Optimizasyonu**
  - [x] Horizontal scroll aktif
  - [x] iOS smooth scrolling (-webkit-overflow-scrolling: touch)
- [x] **Modal & Drawer Responsive**
  - [x] Modal'lar mobile'da full-width
  - [x] Drawer'lar mobile'da full-screen
- [x] **Column Stacking**
  - [x] Grid sütunları mobile'da dikey stack
  - [x] Margin & padding ayarlamaları

#### 9.2. Viewport & HTML Optimizasyonlar ✅
- [x] **Viewport Meta Tag İyileştirmeleri**
  - [x] maximum-scale=5 (kullanıcı zoom izni)
  - [x] user-scalable=yes
- [x] **iOS PWA Desteği**
  - [x] apple-mobile-web-app-capable
  - [x] apple-mobile-web-app-status-bar-style
  - [x] apple-mobile-web-app-title
- [x] **Theme Color Güncellemesi**
  - [x] Primary color (#2196f3)
- [x] **Meta Description & Title**
  - [x] SEO-friendly açıklama
  - [x] Anlamlı sayfa başlığı

#### 9.3. Performance Optimizasyonları ✅
- [x] **React Lazy Loading**
  - [x] Tüm route'lar lazy load
  - [x] Auth sayfaları hariç (immediate load)
  - [x] Suspense wrapper ile fallback
- [x] **Code Splitting**
  - [x] Sayfa bazlı chunk'lar
  - [x] İlk yükleme performansı iyileşti

#### 9.4. Mevcut Component'lerin Responsive Durumu ✅
- [x] **Sidebar**
  - [x] Mobile'da drawer mode (transform: translateX)
  - [x] Overlay ile kullanım
  - [x] Collapse/expand mekanizması
- [x] **Header**
  - [x] Mobile'da kompakt görünüm
  - [x] Search gizleniyor
  - [x] User name gizleniyor
  - [x] Menu toggle butonu aktif
- [x] **Tables**
  - [x] Horizontal scroll aktif
  - [x] Compact font size (mobile)
- [x] **Cards & Grids**
  - [x] Ant Design Grid sistemi responsive
  - [x] xs/sm/md/lg breakpoints kullanılıyor

#### 9.5. Font & Typography Responsive ✅
- [x] **Mobile Font Scaling**
  - [x] 576px altı için küçültülmüş heading'ler
  - [x] Base font 16px (iOS zoom önleme)
  - [x] Statistic text'ler kompakt

#### Tamamlanmayan (Gelecek özellikler)
- [ ] MobileTabBar (bottom navigation)
- [ ] Swipe gestures
- [ ] Image lazy loading & optimization
- [ ] Service worker & offline mode

---

### **FAZ 10: Erişilebilirlik (A11y)** (Tahmini: 2-3 gün)

- [ ] Klavye navigasyonu (Tab/Shift+Tab)
- [ ] Focus ring'ler görünür olsun
- [ ] ARIA label'ları ekle
- [ ] Kontrast kontrol (WCAG AA)
- [ ] Ekran okuyucu test (NVDA/VoiceOver)
- [ ] Semantik HTML kullan

---

### **FAZ 11: Test & Bug Fixes** (Tahmini: 3-4 gün)

- [ ] Manuel test senaryoları
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Mobile device test (iOS, Android)
- [ ] Performance audit (Lighthouse)
- [ ] Bug tracking & fixes

---

## 📚 Teknik Stack & Yeni Kütüphaneler

### Mevcut Kütüphaneler (Korunacak)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.27.0",
  "antd": "^5.21.6",
  "axios": "^1.7.7",
  "moment": "^2.30.1",
  "moment-timezone": "^0.5.46"
}
```

### Eklenecek Yeni Kütüphaneler

#### 1. **State Management & Data Fetching**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```
**Amaç:** Server state management, caching, refetching

#### 2. **Grafikler & Görselleştirme**
```bash
npm install recharts
```
**Amaç:** Line charts, donut charts, area charts
**Alternatif:** Chart.js + react-chartjs-2

#### 3. **Form Yönetimi**
```bash
npm install react-hook-form yup
```
**Amaç:** Form validasyonu, performans
**Not:** Ant Design form yerine kullanılabilir (opsiyonel)

#### 4. **Export Fonksiyonları**
```bash
npm install react-csv xlsx jspdf jspdf-autotable html2canvas
```
**Amaç:**
- `react-csv`: CSV export
- `xlsx`: Excel export
- `jspdf`: PDF generation
- `html2canvas`: Grafikleri PDF'e eklemek için

#### 5. **Utility & Helpers**
```bash
npm install date-fns lodash classnames
```
**Amaç:**
- `date-fns`: Moment.js alternatifi (daha hafif)
- `lodash`: Utility fonksiyonları (debounce, groupBy, etc.)
- `classnames`: Koşullu CSS class'ları

#### 6. **Icons**
```bash
npm install @ant-design/icons
```
**Not:** Zaten antd ile geliyor, ama explicitly eklemek iyi

#### 7. **Responsive & Media Queries**
```bash
npm install react-responsive
```
**Amaç:** Breakpoint bazlı component render

---

## 📁 Yeni Dizin Yapısı

```
src/
├── assets/               # Görseller, ikonlar, fontlar
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/           # Reusable components
│   ├── Common/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   └── index.js
│   │   ├── Card/
│   │   ├── EmptyState/
│   │   ├── Loading/
│   │   ├── Skeleton/
│   │   ├── Toast/
│   │   ├── ConfirmDialog/
│   │   └── index.js      # Barrel export
│   │
│   ├── Layout/
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   ├── Header.module.css
│   │   │   ├── UserMenu.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── index.js
│   │   ├── Sidebar/
│   │   ├── MobileTabBar/
│   │   ├── Footer/
│   │   └── index.js
│   │
│   ├── Market/           # Piyasa sayfası bileşenleri
│   │   ├── PriceCard/
│   │   ├── PriceGrid/
│   │   ├── MarketFilters/
│   │   ├── DetailDrawer/
│   │   ├── PriceChart/
│   │   ├── Sparkline/
│   │   └── index.js
│   │
│   ├── Portfolio/        # Portföy bileşenleri
│   │   ├── PortfolioCard/
│   │   ├── PortfolioGrid/
│   │   ├── PortfolioSummary/
│   │   ├── PortfolioValueChart/
│   │   ├── AllocationDonut/
│   │   ├── PerformanceTable/
│   │   ├── TransactionsTable/
│   │   ├── AddTransactionModal/
│   │   ├── CreatePortfolioModal/
│   │   └── index.js
│   │
│   ├── Form/             # Form bileşenleri
│   │   ├── DateRangePicker/
│   │   ├── InstrumentSelect/
│   │   ├── FormInput/
│   │   ├── FormSelect/
│   │   └── index.js
│   │
│   └── Chart/            # Grafik wrapper'ları
│       ├── LineChart/
│       ├── DonutChart/
│       ├── AreaChart/
│       └── index.js
│
├── contexts/             # React Context API
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── DateRangeContext.jsx   # Global tarih aralığı
│   └── index.js
│
├── hooks/                # Custom hooks
│   ├── useAuth.js
│   ├── useRates.js
│   ├── usePortfolio.js
│   ├── useDebounce.js
│   ├── useResponsive.js
│   ├── useLocalStorage.js
│   └── index.js
│
├── pages/                # Sayfa componentleri
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Market/
│   │   └── MarketPage.jsx
│   ├── Portfolio/
│   │   ├── PortfolioList.jsx
│   │   └── PortfolioDetail.jsx
│   ├── Reports/
│   │   └── ReportsPage.jsx
│   ├── Settings/
│   │   └── SettingsPage.jsx
│   └── index.js
│
├── services/             # API servisleri
│   ├── api.js            # Axios instance
│   ├── authApi.js
│   ├── marketApi.js
│   ├── portfolioApi.js
│   ├── assetApi.js
│   ├── favoriteApi.js    # Gelecek
│   └── index.js
│
├── utils/                # Utility fonksiyonları
│   ├── formatters.js     # formatTL, formatDate, formatPercent
│   ├── calculators.js    # Kar/zarar, volatilite hesaplama
│   ├── validators.js     # Form validation helpers
│   ├── constants.js      # Sabitler (DATE_FORMATS, COLORS, etc.)
│   ├── exporters.js      # CSV/PDF export fonksiyonları
│   └── index.js
│
├── styles/               # Global stiller
│   ├── theme.js          # Tema konfigürasyonu (colors, typography)
│   ├── global.css        # Global CSS
│   ├── variables.css     # CSS değişkenleri
│   └── antd-overrides.css # Ant Design override'ları
│
├── App.jsx
├── index.jsx
└── routes.js             # Route tanımları (opsiyonel)
```

---

## 🎨 Tasarım Sistemi Taslağı

### Renk Paleti
```javascript
// src/styles/theme.js

export const colors = {
  // Primary
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    500: '#2196f3',  // Ana mavi
    700: '#1976d2',
    900: '#0d47a1',
  },
  
  // Success (Kazanç)
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    500: '#4caf50',  // Yeşil
    700: '#388e3c',
    900: '#1b5e20',
  },
  
  // Danger (Kayıp)
  danger: {
    50: '#ffebee',
    100: '#ffcdd2',
    500: '#f44336',  // Kırmızı
    700: '#d32f2f',
    900: '#b71c1c',
  },
  
  // Neutral
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Semantic
  background: '#ffffff',
  surface: '#f5f5f5',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  },
  border: '#e0e0e0',
  divider: '#eeeeee',
};

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};

export const breakpoints = {
  xs: '360px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1600px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
```

---

## ⏱️ Toplam Tahmini Süre

| Faz | Süre | Öncelik |
|-----|------|---------|
| Faz 0: Hazırlık | 2-3 gün | 🔴 Kritik |
| Faz 1: Altyapı | 3-4 gün | 🔴 Kritik |
| Faz 2: Piyasa | 5-6 gün | 🔴 Kritik |
| Faz 3: Portföy Listesi | 3-4 gün | 🔴 Kritik |
| Faz 4: Portföy Detay (Grafikler) | 5-6 gün | 🔴 Kritik |
| Faz 5: Portföy Detay (Tablolar) | 4-5 gün | 🔴 Kritik |
| Faz 6: İşlem Ekleme | 4-5 gün | 🔴 Kritik |
| Faz 7: Raporlar | 3-4 gün | 🟡 Orta |
| Faz 8: Ayarlar | 2-3 gün | 🟢 Düşük |
| Faz 9: Mobil | 3-4 gün | 🟡 Orta |
| Faz 10: A11y | 2-3 gün | 🟢 Düşük |
| Faz 11: Test | 3-4 gün | 🔴 Kritik |

**Toplam:** ~40-55 iş günü (8-11 hafta)

**Not:** Paralel çalışma ile süre kısaltılabilir (örn: Backend değişiklikleri sırasında frontend mockları ile devam edilebilir)

---

## 🚦 Kritik Karar Noktaları

### 1. **Transaction Model - Backend'e Eklenecek mi?**

**Seçenek A:** Transaction model ekle (Önerilen)
- ✅ İşlem geçmişi tam izlenebilir
- ✅ Al/Sat işlemlerini ayırabilirsin
- ✅ Export ve analiz kolaylaşır
- ❌ Backend geliştirme gerekli (~3-4 gün)

**Seçenek B:** Asset tablosunu işlem gibi kullan
- ✅ Backend değişikliği yok
- ❌ Al/Sat ayrımı yok
- ❌ Silinen asset'lerin geçmişi kaybolur

**Öneri:** İlk versiyonda Seçenek B, daha sonra Seçenek A'ya migrate et.

---

### 2. **Portföy Değer Serisi - Hesaplama Nerede?**

**Seçenek A:** Backend'de hesapla
- ✅ Performans daha iyi
- ✅ Cache yapılabilir
- ❌ Backend geliştirme gerekli (~2-3 gün)

**Seçenek B:** Frontend'de hesapla
- ✅ Backend değişikliği yok
- ❌ Performans sorunu olabilir (çok veri için)
- ❌ Network trafiği artabilir

**Öneri:** İlk versiyonda Seçenek B (son 30 gün için), daha sonra Seçenek A (tüm geçmiş için).

---

### 3. **Favoriler - LocalStorage vs Database?**

**Seçenek A:** Database'de sakla
- ✅ Cihazlar arası senkron
- ✅ Persistent
- ❌ Backend geliştirme gerekli (~1-2 gün)

**Seçenek B:** LocalStorage'da sakla
- ✅ Backend değişikliği yok
- ✅ Hızlı implementasyon
- ❌ Cihaz spesifik

**Öneri:** İlk versiyonda Seçenek B, MVP sonrası Seçenek A.

---

## 📝 Sonraki Adımlar

### Hemen Yapılacaklar:
1. ✅ Bu planı gözden geçir ve onay al
2. ⬜ Backend kritik değişikliklerini planla
3. ⬜ Tasarım sistemi mockup'larını hazırla (Figma/Adobe XD - opsiyonel)
4. ⬜ Faz 0'ı başlat (kütüphane kurulumu)

### Backend Ekibi İçin Öncelikli Görevler:
1. **Asset Controller Güncellemesi** (purchaseDate, costPrice parametreleri)
2. **Price-at-date Endpoint** (GET /api/rates/price-at)
3. **Portfolio Summary Endpoint** (GET /api/portfolios/:id/summary)

### Frontend Ekibi İçin İlk Sprint:
- **Hafta 1:** Faz 0 + Faz 1
- **Hafta 2-3:** Faz 2 (Piyasa sayfası)
- **Hafta 4:** Faz 3 (Portföy listesi)

---

## 📞 İletişim & Destek

Bu plandaki herhangi bir madde hakkında soru veya değişiklik önerisi için:
- Frontend takımıyla sync meeting ayarla
- Backend API değişiklikleri için backend takımıyla koordinasyon
- Tasarım kararları için UX review toplantısı

---

**Son Güncelleme:** 29 Ekim 2025  
**Versiyon:** 1.0  
**Durum:** 📋 Planlama Aşaması

