# PrintFlow — 3D Yazıcı Takip Sistemi

Baskı süresi, filament stok ve maliyet takibi için minimalist, hızlı web uygulaması.

## 🚀 GitHub Pages ile Yayınlama

### 1. Repository Oluştur
```bash
git init
git add .
git commit -m "feat: PrintFlow v1.0 ilk sürüm"
```

### 2. GitHub'a Push
```bash
git remote add origin https://github.com/KULLANICI_ADIN/printflow.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pages Aç
- Repository → Settings → Pages
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Save → birkaç dakika sonra yayında!

URL: `https://KULLANICI_ADIN.github.io/printflow`

### 4. Telefona Web App Olarak Ekle
- **iOS Safari**: Paylaş → Ana Ekrana Ekle
- **Android Chrome**: Menü → Uygulamayı Yükle / Ana Ekrana Ekle

---

## 📁 Dosya Yapısı

```
printflow/
├── index.html          # Ana HTML shell
├── manifest.json       # PWA manifest
├── css/
│   ├── reset.css       # CSS normalize
│   ├── variables.css   # Design tokens (renkler, spacing...)
│   ├── layout.css      # Sidebar, topbar, grid
│   ├── components.css  # Buton, kart, modal, form, tablo
│   ├── pages.css       # Sayfa-spesifik stiller
│   └── responsive.css  # Tablet & mobil breakpoint'ler
├── js/
│   ├── store.js        # Veri katmanı (localStorage → Firebase hazır)
│   ├── utils.js        # Format, helper fonksiyonlar
│   ├── ui.js           # Modal, toast, nav, burger
│   ├── charts.js       # Chart.js grafikler
│   ├── app.js          # Ana giriş noktası
│   └── pages/
│       ├── dashboard.js  # Dashboard + aktif baskı timer
│       ├── prints.js     # Baskı listesi
│       ├── filaments.js  # Filament stok
│       ├── printers.js   # Yazıcı yönetimi
│       └── cost.js       # Maliyet hesaplayıcı
└── assets/             # İkon ve görseller
```

---

## 🔥 Firebase Entegrasyonu (Sonraki Adım)

`js/store.js` dosyası Firebase için tasarlandı.
Geçiş yapmak için:

1. `firebase.js` ekle (Firebase SDK)
2. `store.js`'deki `load()` ve `save()` fonksiyonlarını
   Firestore çağrılarıyla değiştir
3. Auth için `ui.js`'e login sayfası ekle

---

## ✨ Özellikler

- ✅ Baskı başlat / tamamla / başarısız — canlı timer
- ✅ Filament stok takibi (makara bazlı, kalan gram)
- ✅ Maliyet hesaplama (filament + elektrik + kâr marjı)
- ✅ Aylık baskı grafik + malzeme dağılım pasta grafik
- ✅ Çoklu yazıcı desteği
- ✅ PWA — Ana ekrana eklenebilir
- ✅ Hash-based routing (#dashboard, #prints...)
- ✅ Mobil-first responsive tasarım
- ✅ LocalStorage — internet olmadan çalışır
