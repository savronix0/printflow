# PrintFlow

<p align="center">
  <strong>3D Yazıcı Üretim Takip ve Maliyet Analiz Sistemi</strong>
</p>

<p align="center">
  Modern, karanlık tema odaklı ve glassmorphism efektli bir 3D yazıcı üretim takip uygulaması.
</p>

---

## ✨ Özellikler

### Kimlik Doğrulama
- E-posta/şifre ile kayıt ve giriş
- Şık, glassmorphism tasarımlı auth sayfası
- Korumalı rotalar

### Dashboard
- **Özet kartları**: Toplam harcanan filament (kg), atık (kg), üretim adedi, toplam maliyet
- **Aylık filament kullanım grafiği**: Harcanan ve atık miktarları
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

## 🛠 Teknolojiler

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

<p align="center">
  <strong>PrintFlow</strong> ile 3D baskı maliyetlerinizi takip edin. 🖨️
</p>
