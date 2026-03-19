# PrintFlow - 3D Yazıcı Üretim Takip ve Maliyet Analiz Sistemi

Modern, dark mode ağırlıklı ve glassmorphism efektli bir 3D yazıcı üretim takip uygulaması.

## Teknoloji Yığını

- **React** (Vite)
- **Tailwind CSS**
- **Firebase** (Auth & Realtime Database)
- **Lucide-react** (İkonlar)
- **Recharts** (Grafikler)
- **React Router**

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Firebase projesi oluşturun ve `.env` dosyasını yapılandırın:
   ```bash
   cp .env.example .env
   ```
   `.env` dosyasına Firebase Console'dan aldığınız değerleri ekleyin.

3. Firebase Console'da:
   - Authentication → Email/Password etkinleştirin
   - Realtime Database oluşturun (Build → Realtime Database)
   - `database.rules` dosyasını deploy edin

4. Uygulamayı çalıştırın:
   ```bash
   npm run dev
   ```

## Veri Yapısı (Realtime Database)

- `users/{uid}` - Kullanıcı profili
- `users/{uid}/filaments` - colorName, hexCode, brand, pricePerKg, remainingGram
- `users/{uid}/productions` - productName, modelWeight, totalPrintWeight, quantity, wasteWeight, totalCost, filamentId, createdAt
- `users/{uid}/accessories` - accName, pricePerUnit, stockCount

## Özellikler

- **Auth**: Login/Register sayfası
- **Dashboard**: Toplam filament, atık, üretim adedi, maliyet kartları; son üretimler listesi; bar chart
- **Üretim Ekle**: Model ağırlığı ve toplam baskı ağırlığı girişi, anlık atık ve maliyet hesaplama, filament stok düşümü
- **Filament Envanteri**: Stok ekleme/düzenleme, renk seçici (color picker)
