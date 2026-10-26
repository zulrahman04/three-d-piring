# Ceramix 3D - Custom Plate E-Commerce MVP

Aplikasi web e-commerce kustomisasi piring 3D interaktif dan pemesanan berbasis Next.js App Router, Three.js, React Three Fiber (R3F), dan Tailwind CSS.

![Ceramix 3D Preview](https://img.shields.io/badge/Next.js-16%2B-black?style=for-the-badge&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-R3F-blue?style=for-the-badge&logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge&logo=typescript)

---

## 🌟 Fitur Utama

1. **Interactive 3D Viewport:**
   - **Procedural Ceramic Plate**: Dibangun dengan Three.js `LatheGeometry` beresolusi tinggi (72 segmen) yang meniru lekukan porselen asli lengkap dengan bibir piring (rim) dan cincin dudukan bawah (*footing ring*). Langsung dapat diuji tanpa ketergantungan file eksternal `.glb`.
   - **Studio Lighting & Shadows**: Pencahayaan studio 3-titik (*key light*, *fill light*, *rim specular light*), pantulan HDR `Environment`, serta bayangan kontak lantai yang realistis (`ContactShadows`).
   - **OrbitControls Terbatas**: Sudut kamera dibatasi (`maxPolarAngle`) sehingga kamera tidak bisa menembus lantai atau melihat dari bawah meja.
   - **Preset Sudut Kamera**: Shortcut cepat untuk beralih antara sudut perspektif 3D, tampak atas (*top-down*), dan detail *close-up*.
   - **Auto-Rotate 360°**: Mode rotasi otomatis yang dapat diaktifkan/dinonaktifkan kapan saja.

2. **Customizer Controls (Panel Kustomisasi):**
   - **Upload Desain Gambar**: Dukungan unggah file (PNG transparan, JPG, WebP, SVG) dari perangkat lokal dengan *drag & drop* atau klik tombol unggah.
   - **Koleksi Template Siap Pakai**: 5 desain vektor bawaan (Royal Delft Blue Floral, Botanical Gold Olive, Japanese Wave & Sun, Scandinavian Silhouette, dan 24K Monogram Crest) yang langsung aktif tanpa perlu mencari file terlebih dahulu.
   - **Pilihan Warna Piring Keramik**: Palet warna lengkap (*Porcelain White*, *Matte Obsidian*, *Warm Cream*, *Sage Green*, *Terracotta*, *Blush Pastel*, dan *Midnight Navy*).
   - **Tekstur Glasir (Finishing)**: Pilihan glasir porselen kilap (*Glossy*), doff alami (*Matte*), dan semi-kilap (*Satin*).
   - **Aksen Pinggiran Metalik (Metallic Rim Trim)**: Opsi trim 24K Gold, Platinum Silver, dan Rose Gold dengan shader metalik PBR.
   - **Pengaturan Cetakan (Transformasi)**:
     - Zoom / Skala cetakan (30% - 180%)
     - Rotasi sudut motif (0° - 360°)
     - Penggeser posisi horizontal (X) dan vertikal (Y)
     - Mode cakupan: Cekungan tengah (*center basin*) atau seluruh permukaan (*full plate*)
     - Tombol *reset* posisi instan.

3. **Capture Canvas & Checkout Processing:**
   - **Snapshot Resolusi Tinggi**: Pengambilan gambar hasil kustomisasi 3D secara *real-time* dari canvas WebGL menggunakan `preserveDrawingBuffer` dan `toDataURL('image/png')`.
   - **Modal Ringkasan Pesanan**:
     - *Live preview* gambar hasil snapshot piring yang telah dicustom.
     - Spesifikasi lengkap piring (ukuran, glasir, trim, motif).
     - Stepper jumlah piring (+/-) dengan kalkulasi harga dinamis (harga piring + jasa cetak keramik + aksen metalik).
     - Formulir data pemesan lengkap (Nama, WhatsApp, Email, Alamat, Kota, Kode Pos, Metode Pembayaran QRIS/BCA/Mandiri/GoPay).
     - Simulasi pengiriman data order (API payload logged to console).
     - Layar konfirmasi pesanan dengan nomor ID pesanan unik, animasi selebrasi *confetti*, dan tombol langsung konfirmasi via WhatsApp.

4. **Arsitektur & Manajemen Memori:**
   - **Pencegahan Memory Leak**: Pembersihan tekstur Three.js lama melalui `texture.dispose()` dan pencabutan blob URL melalui `URL.revokeObjectURL()` setiap kali pengguna mengunggah gambar baru atau komponen di-unmount.
   - **Modularitas Komponen**: Pemisahan rapi antara state, logika 3D, dan UI.

---

## 📁 Struktur Folder

```
├── app/
│   ├── globals.css              # Custom styling, scrollbar, dan tokens Tailwind
│   ├── layout.tsx               # Root layout & Google Fonts
│   └── page.tsx                 # Halaman utama (merakit 3D Canvas, Panel, & Modal)
├── components/
│   ├── 3d/
│   │   ├── PlateCanvas.tsx      # R3F Canvas, OrbitControls, pencahayaan, & capture hook
│   │   └── PlateModel.tsx       # Geometri prosedural Lathe, material porselen, decal texture
│   └── ui/
│       ├── CustomizerPanel.tsx  # Sidebar kustomisasi (upload, preset, warna, transform)
│       ├── OrderModal.tsx       # Modal snapshot, ringkasan harga, & form pemesanan
│       ├── Navbar.tsx           # Header navigasi & tombol quick-action
│       └── ViewportControls.tsx # Overlay kontrol kamera & rotasi pada canvas 3D
├── constants/
│   └── presets.ts               # Data preset motif SVG, palet warna, ukuran, dan rim
├── store/
│   └── usePlateStore.ts         # Zustand store untuk state reaktif & kalkulasi harga
└── types/
    └── plate.ts                 # TypeScript interfaces & types
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18.17 atau lebih baru
- NPM / PNPM / Yarn

### 2. Instalasi Dependensi
Dependensi telah terpasang di repository ini. Jika menginstal di komputer baru:
```bash
npm install
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat [http://localhost:3000](http://localhost:3000).

### 4. Menjalankan Production Build
```bash
npm run build
npm run start
```
Proyek telah divalidasi dan terkompilasi 100% tanpa error TypeScript maupun linting.

---

## 💡 Panduan Penggunaan
1. **Memutar & Melihat Piring 3D**:
   - Tahan klik kiri mouse lalu geser untuk memutar piring ke segala arah.
   - Scroll roda mouse untuk memperbesar (*zoom in*) atau memperkecil (*zoom out*).
   - Klik tombol **"Tampak Atas"** di bagian bawah canvas untuk melihat motif piring tegak lurus.
2. **Mengganti Motif / Unggah Gambar**:
   - Klik tab **"Desain"** pada panel kanan.
   - Seret gambar PNG transparan atau foto dari komputer Anda ke dalam kotak putus-putus, atau klik salah satu dari 5 template desain yang tersedia.
3. **Mengatur Ukuran, Warna, dan Finishing**:
   - Klik tab **"Piring"** untuk memilih ukuran (Dinner 27cm, Salad 21cm, Dessert 16cm), warna dasar keramik, dan aksen pinggiran metalik (emas 24K, perak platinum).
4. **Mengatur Skala & Posisi Cetakan**:
   - Klik tab **"Atur Posisi"** untuk menggeser motif atau memperbesar/memperkecil skala cetakan.
5. **Pemesanan**:
   - Klik tombol **"Pesan Sekarang / Checkout"**.
   - Sistem akan otomatis mengambil snapshot kanvas 3D, menampilkan ringkasan harga, lalu isi data pemesan dan klik **"Konfirmasi & Buat Pesanan"**.
