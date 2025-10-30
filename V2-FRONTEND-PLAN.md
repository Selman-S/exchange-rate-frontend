# Frontend V2 Geliştirme Planı

## 📋 Version 2 Hedefleri

Version 1'de temel CRUD, raporlama ve mobil optimizasyon tamamlandı. Version 2'de kullanıcı deneyimini iyileştirecek analiz araçları ve UI/UX geliştirmeleri yapılacak.

---

## 🔴 Yüksek Öncelik - V2.1 Sprint

### 1. Ana Sayfa Yenileme (Saatlik Veri Gösterimi) ⏰

**Hedef:** Bugünün saatlik kurlarını göster, geçmiş günleri günlük göster.

#### 1.1. Homepage Redesign
- **Bugünün Saatlik Verileri**
  - Saat bazlı tabs (09:00, 10:00, 11:00... 18:00)
  - Aktif saati otomatik highlight
  - Swipe gesture ile saat değiştirme (mobile)
  
- **Geçmiş Günler**
  - DatePicker ile tarih seçimi
  - Seçilen gün için günlük özet
  - Önceki günle karşılaştırma

**Komponentler:**
```
src/pages/Home/Home.jsx
└── HomeHourlyView (Bugün)
    ├── HourTabs
    ├── PriceGridHourly
    └── ChangeIndicators

└── HomeDailyView (Geçmiş)
    ├── DateSelector
    ├── DailySummaryCards
    └── PriceComparison
```

**API Integration:**
- `GET /api/rates/hourly?date=2025-10-30`
- `useHourlyRates()` hook

**Tahmini Süre:** 5-6 saat

---

### 2. Fiyat Alarm Sistemi 🔔

**Hedef:** Kullanıcılar fiyat hedefi belirleyebilsin, alarm oluşturabilsin.

#### 2.1. Alarm Yönetimi Sayfası
- Alarm listesi (aktif/pasif/tetiklenmiş)
- Yeni alarm oluşturma modal
- Alarm düzenleme/silme

**Komponentler:**
```
src/pages/Alerts/
├── AlertsPage.jsx
│   ├── AlertsList
│   │   └── AlertCard (with toggle, edit, delete)
│   └── CreateAlertModal
└── AlertsPage.css
```

**Alert Card Özellikleri:**
- Varlık adı + icon
- Condition (> < =)
- Hedef fiyat
- Aktif/Pasif toggle
- Son tetiklenme zamanı
- Düzenle/Sil butonları

**Create Alert Modal:**
```jsx
<Form>
  <Select label="Varlık Türü">
    <Option>Altın</Option>
    <Option>Döviz</Option>
  </Select>
  
  <Select label="Varlık">
    {/* Dynamic based on type */}
  </Select>
  
  <Radio.Group label="Koşul">
    <Radio value="ABOVE">Üzerine Çıkınca</Radio>
    <Radio value="BELOW">Altına Düşünce</Radio>
  </Radio.Group>
  
  <InputNumber label="Hedef Fiyat" prefix="₺" />
  
  <Select label="Fiyat Türü">
    <Option value="sellPrice">Satış Fiyatı</Option>
    <Option value="buyPrice">Alış Fiyatı</Option>
  </Select>
  
  <TextArea label="Not (Opsiyonel)" />
</Form>
```

**Notification Component:**
- Toast notification when alert triggers
- Browser notification (if permitted)
- Alert history panel

**API Integration:**
- `useAlerts()` - List
- `useCreateAlert()` - Create
- `useUpdateAlert()` - Update
- `useDeleteAlert()` - Delete
- `useToggleAlert()` - Activate/Deactivate

**Route:**
- `/alerts`

**Sidebar Link:**
- Add "Fiyat Alarmları" 🔔

**Tahmini Süre:** 6-7 saat

---

### 3. Haftalık/Aylık Değişim Gösterimi 📈

**Hedef:** Piyasa sayfasında farklı dönem değişimlerini göster.

#### 3.1. PriceCard Geliştirmesi
Mevcut PriceCard'a period selector ekle:

```jsx
<PriceCard>
  <PeriodChips>
    <Chip active>1G</Chip>
    <Chip>1H</Chip>
    <Chip>1A</Chip>
    <Chip>1Y</Chip>
  </PeriodChips>
  
  <ChangeDisplay>
    {changePercent >= 0 ? '↑' : '↓'} {changePercent}%
  </ChangeDisplay>
  
  {/* Sparkline için selected period */}
  <Sparkline data={sparklineData} />
</PriceCard>
```

**API Integration:**
- `GET /api/rates/change?type=currency&name=Dolar&period=weekly`
- `useRateChange(type, name, period)` hook

**Caching:**
- React Query ile 5 dakika cache
- Period değişiminde yeni fetch

**Tahmini Süre:** 3-4 saat

---

## 🟡 Orta Öncelik - V2.2 Sprint

### 4. Getiri Hesaplama Simülatörü 🧮

**Hedef:** "1 yıl önce X TL altın alsaydım bugün ne kazanırdım?" hesaplayıcı.

#### 4.1. Simulator Sayfası
```
src/pages/Simulator/
├── SimulatorPage.jsx
│   ├── CalculatorForm
│   ├── ResultCard
│   └── ComparisonChart
└── SimulatorPage.css
```

**Form:**
```jsx
<Form layout="vertical">
  <Select label="Varlık Türü">
    <Option>Altın</Option>
    <Option>Döviz</Option>
  </Select>
  
  <Select label="Varlık">
    {/* Dynamic */}
  </Select>
  
  <InputNumber 
    label="Miktar" 
    placeholder="100"
  />
  
  <DatePicker 
    label="Alış Tarihi" 
    maxDate={new Date()}
  />
  
  <DatePicker 
    label="Karşılaştırma Tarihi (Opsiyonel)" 
    maxDate={new Date()}
    placeholder="Bugün"
  />
  
  <Button type="primary">Hesapla</Button>
</Form>
```

**Result Card:**
```jsx
<Card title="Yatırım Sonucu">
  <Statistic 
    title="Başlangıç Değeri"
    value={initialValue}
    prefix="₺"
  />
  
  <Statistic 
    title="Güncel Değer"
    value={currentValue}
    prefix="₺"
  />
  
  <Statistic 
    title="Toplam Getiri"
    value={totalReturn}
    prefix="₺"
    valueStyle={{ color: totalReturn >= 0 ? 'green' : 'red' }}
  />
  
  <Statistic 
    title="Getiri Oranı"
    value={returnPercent}
    suffix="%"
  />
  
  <Statistic 
    title="Yıllık Getiri"
    value={annualizedReturn}
    suffix="%"
  />
  
  <Divider />
  
  <Row>
    <Col span={12}>
      <Text type="secondary">Süre</Text>
      <p>{durationDays} gün</p>
    </Col>
    <Col span={12}>
      <Text type="secondary">Başlangıç Fiyatı</Text>
      <p>₺{initialPrice}</p>
    </Col>
  </Row>
</Card>
```

**Comparison Chart (Opsiyonel):**
- Line chart showing value growth over time
- Portfolio value vs initial investment

**API Integration:**
- `POST /api/calculator/return`
- `useCalculateReturn()` mutation

**Route:**
- `/simulator` veya `/calculator`

**Sidebar Link:**
- Add "Getiri Hesaplama" 🧮

**Tahmini Süre:** 5-6 saat

---

### 5. Favoriler Backend'e Taşıma 💾

**Hedef:** Favorileri LocalStorage'dan backend'e taşı, cihazlar arası senkron.

#### 5.1. Migration Flow
1. **Migration Modal (First Login After Update):**
```jsx
<Modal 
  title="Favorilerinizi Senkronize Edin"
  visible={showMigrationModal}
>
  <p>LocalStorage'da {favoritesCount} favori bulundu.</p>
  <p>Bu favorileri hesabınıza kaydetmek ister misiniz?</p>
  
  <Button type="primary" onClick={handleMigrate}>
    Evet, Kaydet
  </Button>
  <Button onClick={handleSkip}>
    Hayır, Geçiş Yapma
  </Button>
</Modal>
```

2. **useEffect in Market Page:**
```jsx
useEffect(() => {
  const localFavorites = getLocalStorageFavorites();
  const { data: backendFavorites } = useFavorites();
  
  if (localFavorites.length > 0 && backendFavorites?.length === 0) {
    setShowMigrationModal(true);
  }
}, []);
```

3. **Migration API Call:**
```jsx
const migrateFavorites = async () => {
  const localFavorites = getLocalStorageFavorites();
  await api.post('/favorites/migrate', { favorites: localFavorites });
  localStorage.removeItem('favorites');
  refetchFavorites();
};
```

#### 5.2. Update Market Components
- Replace `useLocalStorage` with `useFavorites()` hook
- Add optimistic updates
- Loading states

**API Integration:**
- `useFavorites()` - GET /api/favorites
- `useToggleFavorite()` - POST/DELETE
- `useFavoriteMigration()` - POST /api/favorites/migrate

**Tahmini Süre:** 3-4 saat

---

### 6. Karşılaştırma Sayfası 📊

**Hedef:** Farklı varlıkların performansını kıyasla (normalize).

#### 6.1. Comparison Page
```
src/pages/Comparison/
├── ComparisonPage.jsx
│   ├── AssetSelector (Multi-select)
│   ├── DateRangeSelector
│   ├── NormalizeToggle
│   ├── ComparisonChart (Recharts)
│   └── PerformanceTable
└── ComparisonPage.css
```

**Asset Selector:**
```jsx
<Form.Item label="Varlıkları Seçin (Maks 5)">
  <Select 
    mode="multiple"
    maxCount={5}
    placeholder="Örn: Dolar, Euro, Gram Altın"
  >
    <OptGroup label="Dövizler">
      <Option value="currency-Dolar">🇺🇸 Dolar</Option>
      <Option value="currency-Euro">🇪🇺 Euro</Option>
    </OptGroup>
    <OptGroup label="Altınlar">
      <Option value="gold-Gram Altın">🥇 Gram Altın</Option>
      <Option value="gold-Çeyrek Altın">🪙 Çeyrek Altın</Option>
    </OptGroup>
  </Select>
</Form.Item>
```

**Comparison Chart:**
```jsx
<LineChart data={comparisonData}>
  <XAxis dataKey="date" />
  <YAxis label={normalized ? "%" : "₺"} />
  <Tooltip />
  <Legend />
  
  {series.map((s, i) => (
    <Line 
      key={i}
      type="monotone" 
      dataKey="value" 
      data={s.data}
      name={s.assetName}
      stroke={s.color}
    />
  ))}
</LineChart>
```

**Performance Table:**
| Varlık | Başlangıç | Güncel | Değişim | Değişim % |
|--------|-----------|--------|---------|-----------|
| Dolar  | 32.50₺    | 34.52₺ | +2.02₺  | +6.21%   |
| Gram Altın | 2100₺ | 2862₺  | +762₺   | +36.29%  |

**Normalize Toggle:**
- Normalize edilmiş: Tüm varlıklar 100 bazında
- Normal: Gerçek fiyatlar

**API Integration:**
- `GET /api/rates/comparison?assets=...&from=...&to=...&normalize=true`
- `useComparison(assets, dateRange, normalized)` hook

**Route:**
- `/comparison`

**Sidebar Link:**
- Add "Karşılaştırma" 📊

**Tahmini Süre:** 6-7 saat

---

## 🟢 Düşük Öncelik - V2.3 Sprint

### 7. Piyasa Detay Drawer 🔍

**Hedef:** Piyasa sayfasında varlık kartına tıklayınca detaylı panel açılsın.

#### 7.1. Detail Drawer Component
```jsx
<Drawer
  title={`${assetName} Detayları`}
  placement="right"
  width={640}
  visible={visible}
  onClose={onClose}
>
  {/* Current Price Section */}
  <Card>
    <Statistic 
      title="Alış Fiyatı"
      value={buyPrice}
      prefix="₺"
    />
    <Statistic 
      title="Satış Fiyatı"
      value={sellPrice}
      prefix="₺"
    />
  </Card>
  
  {/* Change Statistics */}
  <Card title="Değişim İstatistikleri">
    <Row gutter={16}>
      <Col span={12}>
        <Statistic title="Günlük" value={dailyChange} suffix="%" />
      </Col>
      <Col span={12}>
        <Statistic title="Haftalık" value={weeklyChange} suffix="%" />
      </Col>
      <Col span={12}>
        <Statistic title="Aylık" value={monthlyChange} suffix="%" />
      </Col>
      <Col span={12}>
        <Statistic title="Yıllık" value={yearlyChange} suffix="%" />
      </Col>
    </Row>
  </Card>
  
  {/* Historical Chart */}
  <Card title="Geçmiş Fiyatlar">
    <PeriodSelector value={period} onChange={setPeriod} />
    <LineChart data={historicalData} height={300} />
  </Card>
  
  {/* Quick Actions */}
  <Card title="Hızlı İşlemler">
    <Space>
      <Button icon={<HeartOutlined />}>
        Favorilere Ekle
      </Button>
      <Button icon={<BellOutlined />}>
        Alarm Oluştur
      </Button>
      <Button icon={<PlusOutlined />}>
        Portföye Ekle
      </Button>
    </Space>
  </Card>
</Drawer>
```

**Tahmini Süre:** 4-5 saat

---

### 8. Merkez Bankası vs Piyasa Kuru Gösterimi 🏦

**Hedef:** TCMB kuru ile piyasa kuru karşılaştırması.

#### 8.1. Rate Comparison Badge
```jsx
<PriceCard>
  {/* Existing content */}
  
  {centralBankRate && (
    <Tooltip title="TCMB Kuru">
      <Badge>
        <BankOutlined /> ₺{centralBankRate}
      </Badge>
    </Tooltip>
  )}
  
  {spread > 0 && (
    <Tag color="orange">
      Fark: ₺{spread.toFixed(2)}
    </Tag>
  )}
</PriceCard>
```

**Comparison Modal:**
```jsx
<Modal title="TCMB vs Piyasa Kuru Karşılaştırması">
  <Table>
    <Column title="Döviz" dataIndex="name" />
    <Column title="TCMB Kuru" dataIndex="centralBankRate" />
    <Column title="Piyasa Kuru" dataIndex="marketRate" />
    <Column title="Fark" dataIndex="spread" />
    <Column title="Fark %" dataIndex="spreadPercent" />
  </Table>
</Modal>
```

**Tahmini Süre:** 3-4 saat

---

### 9. Ayar Seçenekleri (24/22/18 Ayar) 🥇

**Hedef:** Altın fiyatlarında ayar seçimi.

#### 9.1. Purity Selector
```jsx
<Select 
  value={selectedPurity} 
  onChange={setPurity}
  style={{ width: 100 }}
>
  <Option value={24}>24 Ayar</Option>
  <Option value={22}>22 Ayar</Option>
  <Option value={18}>18 Ayar</Option>
  <Option value={14}>14 Ayar</Option>
</Select>
```

**Price Calculation:**
```jsx
const calculatePriceByPurity = (basePrice, purity) => {
  return basePrice * (purity / 24);
};

// Display
<Statistic 
  title={`Gram Altın (${selectedPurity} Ayar)`}
  value={calculatePriceByPurity(gramPrice, selectedPurity)}
  prefix="₺"
/>
```

**Tahmini Süre:** 2-3 saat

---

## 🎨 UI/UX İyileştirmeleri

### 10. Genel Tasarım İyileştirmeleri

#### 10.1. Ana Sayfa Hero Section
```jsx
<HeroSection>
  <Typography.Title level={1}>
    Anlık Döviz & Altın Kurları
  </Typography.Title>
  
  <Row gutter={16}>
    <Col span={8}>
      <Statistic 
        title="🇺🇸 Dolar"
        value={usdRate}
        prefix="₺"
        suffix={<Badge color="green">↑ 2.1%</Badge>}
      />
    </Col>
    <Col span={8}>
      <Statistic 
        title="🇪🇺 Euro"
        value={eurRate}
        prefix="₺"
        suffix={<Badge color="red">↓ 0.5%</Badge>}
      />
    </Col>
    <Col span={8}>
      <Statistic 
        title="🥇 Gram Altın"
        value={goldRate}
        prefix="₺"
        suffix={<Badge color="green">↑ 3.2%</Badge>}
      />
    </Col>
  </Row>
  
  <Space style={{ marginTop: 24 }}>
    <Link to="/market">
      <Button type="primary" size="large">
        Tüm Kurları Gör
      </Button>
    </Link>
    <Link to="/simulator">
      <Button size="large">
        Getiri Hesapla
      </Button>
    </Link>
  </Space>
</HeroSection>
```

#### 10.2. Animated Number Changes
```jsx
import { animated, useSpring } from 'react-spring';

const AnimatedPrice = ({ value }) => {
  const props = useSpring({ 
    number: value, 
    from: { number: 0 },
    config: { duration: 1000 }
  });
  
  return (
    <animated.span>
      {props.number.to(n => n.toFixed(2))}
    </animated.span>
  );
};
```

#### 10.3. Loading Skeletons
- Replace all `<Loading />` with Ant Design Skeleton
- Shimmer effect for better UX

#### 10.4. Empty States with Illustrations
- Add SVG illustrations for empty states
- CTA buttons for quick actions

**Tahmini Süre:** 4-5 saat

---

## 📊 V2 Özet Tablo

| Özellik | Route | Öncelik | Süre | Sprint |
|---------|-------|---------|------|--------|
| Ana Sayfa Saatlik Veri | / | 🔴 Yüksek | 5-6h | V2.1 |
| Fiyat Alarmı | /alerts | 🔴 Yüksek | 6-7h | V2.1 |
| Haftalık/Aylık Değişim | /market | 🔴 Yüksek | 3-4h | V2.1 |
| Getiri Simülatörü | /simulator | 🟡 Orta | 5-6h | V2.2 |
| Favoriler Backend | - | 🟡 Orta | 3-4h | V2.2 |
| Karşılaştırma Sayfası | /comparison | 🟡 Orta | 6-7h | V2.2 |
| Piyasa Detay Drawer | /market | 🟢 Düşük | 4-5h | V2.3 |
| TCMB vs Piyasa | /market | 🟢 Düşük | 3-4h | V2.3 |
| Ayar Seçenekleri | /market | 🟢 Düşük | 2-3h | V2.3 |
| UI/UX İyileştirmeleri | - | 🟢 Düşük | 4-5h | V2.3 |

**Toplam Frontend V2 Geliştirme Süresi:**
- V2.1 Sprint: 14-17 saat (~2 gün)
- V2.2 Sprint: 14-17 saat (~2 gün)
- V2.3 Sprint: 13-17 saat (~2 gün)

**Toplam: ~6 gün**

---

## 📦 Yeni Kütüphaneler

```bash
# Animation
npm install react-spring

# Notifications (if needed)
npm install react-toastify

# Charts enhancement (if needed)
npm install lightweight-charts
```

---

## 🚀 Deployment Checklist V2

### Before Deploy
- [ ] Favoriler migration testi
- [ ] Alarm notification permissions
- [ ] Browser notification support check
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser test

### After Deploy
- [ ] Monitor alarm cron job
- [ ] Check notification delivery
- [ ] Verify API rate limits
- [ ] User feedback collection

---

**Son Güncelleme:** 30 Ekim 2025  
**Versiyon:** 2.0  
**Frontend Tahmini Toplam Süre:** 6 gün  
**Backend + Frontend Toplam:** ~10 gün

