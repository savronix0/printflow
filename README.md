# PrintFlow

<p align="center">
  <strong>3D Yazıcı Üretim Takip ve Maliyet Analiz Sistemi</strong>
</p>

<p align="center">
  Modern, karanlık tema odaklı ve glassmorphism efektli bir 3D yazıcı üretim takip uygulaması.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?logo=firebase" alt="Firebase" />
</p>

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
- [Firebase Yapılandırması](#-firebase-yapılandırması)
- [Veri Yapısı](#-veri-yapısı)
- [Proje Yapısı](#-proje-yapısı)
- [Kullanım Rehberi](#-kullanım-rehberi)
- [Dağıtım](#-dağıtım)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### Kimlik Doğrulama
- E-posta/şifre ile kayıt ve giriş
- Şık, glassmorphism tasarımlı auth sayfası
- Korumalı rotalar

### Dashboard
- **Özet kartları**: Toplam harcanan filament (kg), atık (kg), üretim adedi, toplam maliyet
- **Aylık filament kullanım grafiği**: Recharts Bar Chart ile harcanan ve atık miktarları
- Son yapılan üretimler tablosu
- Üretimler ve Ürün Maliyeti sayfalarına hızlı linkler

### Üretim Yönetimi
- **Üretim Ekle**: Slicer verileri ile üretim kaydı
  - Birden fazla filament seçimi (multi-material baskılar için)
  - Model ağırlığı (parça başına veya toplam)
  - Baskı süresi (saat) — elektrik ve makine yıpranması otomatik hesaplanır
  - Anlık atık, maliyet ve adet başına maliyet önizlemesi
  - Fire payı (başarısız baskı oranı) otomatik eklenir
- **Üretimler**: Tüm kayıtları listele, düzenle, sil
- Filament stoktan otomatik düşüm

### Ürünler & Maliyet Analizi
- Ürün bazlı gruplama
- **Otomatik hesaplanan maliyetler**:
  - Filament (parça başına)
  - Elektrik (baskı süresi × makine kW × elektrik fiyatı)
  - Makine yıpranması
  - Fire payı
- **Aksesuar seçimi**: Listeden aksesuar ekleyip parça başına miktar belirleme
- Final birim maliyet hesaplama

### Filament Envanteri
- Renk seçici (color picker) ile filament tanımlama
- Marka, kg fiyatı, kalan gram
- Stok ekleme, düzenleme, silme

### Aksesuarlar
- "Kaç TL'ye kaç tane aldım" mantığı — birim fiyat otomatik hesaplanır
- Halka, zincir vb. aksesuarlar için stok takibi
- Ürün maliyetine entegrasyon

### Ayarlar
- **Makine gücü (kW)**: Elegoo CC2 veya herhangi bir makine için saatlik tüketim
- **Elektrik fiyatı (₺/kWh)**
- **Makine yıpranması (₺/saat)**
- **Fire oranı (%)**: Yapışmama, hata vb. başarısız baskılar için maliyet payı

### Tasarım
- Koyu tema (Dark Mode)
- Glassmorphism efektleri
- Responsive tasarım (mobil uyumlu)
- DM Sans fontu

---

## 📸 Ekran Görüntüleri

> Projeyi çalıştırdıktan sonra bu bölüme ekran görüntüleri ekleyebilirsiniz.

```
/screenshots
├── dashboard.png
├── add-production.png
├── products.png
└── filaments.png
```

---

## 🛠 Teknoloji Yığını

| Teknoloji | Kullanım |
|-----------|----------|
| **React 19** | UI kütüphanesi |
| **Vite 8** | Build aracı |
| **Tailwind CSS 4** | Styling |
| **Firebase** | Auth & Realtime Database |
| **Lucide React** | İkonlar |
| **Recharts** | Grafikler |
| **React Router 7** | Sayfa yönlendirme |
| **date-fns** | Tarih formatlama |

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm

### Adımlar

1. **Repoyu klonlayın**
   ```bash
   git clone https://github.com/KULLANICI_ADI/printflow.git
   cd printflow
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini yapılandırın**
   ```bash
   cp .env.example .env
   ```
   `.env` dosyasına Firebase projenizin değerlerini ekleyin (aşağıya bakın).

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```
   Uygulama `http://localhost:5173` adresinde açılır.

5. **Production build**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔥 Firebase Yapılandırması

### 1. Firebase Projesi Oluşturma
1. [Firebase Console](https://console.firebase.google.com/) → Yeni proje oluşturun
2. **Authentication** → Sign-in method → **Email/Password** etkinleştirin
3. **Realtime Database** → Oluştur → Bölge seçin (örn. europe-west1)

### 2. Web Uygulaması Kaydı
1. Proje ayarları → Genel → Uygulamalar → Web ikonu
2. Uygulama adı girin, kaydedin
3. Config değerlerini kopyalayın

### 3. .env Dosyası
Proje kökünde `.env` dosyası oluşturun:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

### 4. Realtime Database Kuralları
Firebase Console → Realtime Database → Kurallar sekmesi:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

Veya `database.rules` dosyasını Firebase CLI ile deploy edin:
```bash
firebase deploy --only database
```

---

## 📊 Veri Yapısı

### Firebase Realtime Database

```
users/
└── {uid}/
    ├── email, displayName, createdAt     # Kullanıcı profili
    ├── settings/                         # Ayarlar (tek obje)
    │   ├── machineKW
    │   ├── electricityPricePerKwh
    │   ├── wearCostPerHour
    │   └── failureRatePercent
    ├── filaments/
    │   └── {filamentId}/
    │       ├── colorName, hexCode, brand
    │       ├── pricePerKg, remainingGram
    │       └── ...
    ├── productions/
    │   └── {productionId}/
    │       ├── productName
    │       ├── modelWeight, totalPrintWeight, quantity
    │       ├── wasteWeight, totalCost
    │       ├── filamentCost, electricityCost, wearCost, failureCost
    │       ├── printTimeHours
    │       ├── filamentUsages: [{ filamentId, gramsUsed }]
    │       └── createdAt
    └── accessories/
        └── {accessoryId}/
            ├── accName
            ├── totalPrice, quantityPurchased
            ├── pricePerUnit, stockCount
            └── ...
```

---

## 📁 Proje Yapısı

```
printflow/
├── public/
├── src/
│   ├── components/          # Ortak bileşenler
│   │   ├── ErrorBoundary.jsx
│   │   ├── Layout.jsx       # Sidebar + navigasyon
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAccessories.js
│   │   ├── useFilaments.js
│   │   ├── useProductions.js
│   │   └── useSettings.js
│   ├── lib/
│   │   └── firebase.js
│   ├── pages/
│   │   ├── AccessoriesPage.jsx
│   │   ├── AddProduction.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FilamentInventory.jsx
│   │   ├── Products.jsx
│   │   ├── Productions.jsx
│   │   └── SettingsPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── database.rules
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📖 Kullanım Rehberi

### İlk Kurulum
1. **Ayarlar** sayfasına gidin
2. Makine kW, elektrik fiyatı, yıpranma ve fire oranını girin
3. **Filament Envanteri**nden filamentlerinizi ekleyin
4. İhtiyaç varsa **Aksesuarlar**dan halka, zincir vb. ekleyin

### Üretim Ekleme
1. **Üretim Ekle** sayfasını açın
2. Ürün adı, model ağırlığı, toplam baskı ağırlığı (slicer), adet girin
3. Baskı süresini saat cinsinden girin (örn: 2.5)
4. Kullanılan filamentleri ve gram miktarlarını ekleyin
5. Anlık hesaplamayı kontrol edip kaydedin

### Maliyet Analizi
1. **Ürünler** sayfasında ürün kartını genişletin
2. Filament, elektrik, yıpranma ve fire otomatik hesaplanır
3. Aksesuar eklemek için +/- ile miktar belirleyin
4. Final birim maliyet otomatik güncellenir

---

## 🌐 Dağıtım

### Vercel / Netlify
- Build komutu: `npm run build`
- Çıktı klasörü: `dist`
- Ortam değişkenlerini `.env` değerleriyle tanımlayın

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/amazing`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<p align="center">
  <strong>PrintFlow</strong> ile 3D baskı maliyetlerinizi takip edin. 🖨️
</p>
