# OpenUI Design Specification (`DESIGN.md`) — Anti-AI Natural Utilitarian

Dokumen ini mendefinisikan standar visual dan panduan interaksi untuk antarmuka web **Stamps Technical Assessment — Section A (Mini Test)**. Antarmuka ini dirancang secara sadar mengacu pada filosofi *Natural Utilitarian Engineering Tools* (seperti Stripe Dashboard klasik, GitHub Primer, atau Linear) dan **menolak estetika cetakan template AI**.

---

## 1. Prinsip Anti-AI UI

| Pola Khas Template AI (Dilarang) | Standar OpenUI Natural Utilitarian (Diterapkan) |
|---|---|
| Gradien warna ungu/indigo/neon (`linear-gradient(...)`) | Warna kanvas netral (`#F6F8FA`) dengan kontainer permukaan putih (`#FFFFFF`) |
| Sudut terlalu membulat (`rounded-2xl` / `rounded-3xl`, `16px-24px`) | Sudut tajam & fungsional (`border-radius: 4px` hingga `6px`) |
| Bayangan tebal buram (*diffuse heavy drop shadows*) | Garis batas presisi `1px solid #D1D9E0` dengan bayangan mikro `0 1px 2px rgba(0,0,0,0.04)` |
| Ikon kosmetik berlebihan di setiap teks/kartu | Hirarki dibangun murni lewat tipografi, spasi, kontras warna, dan garis pemisah semantik |
| Kartu metrik palsu bergaya Bento Grid | Struktur utilitarian: Header ringkas, Tab Bar semantik, Preformatted Code Output, Data Table |
| Animasi lambat, memantul (*bouncing*), atau bersinar (*glowing*) | Transisi cepat (`120ms ease`) hanya pada pergantian status aktif dan hover |

---

## 2. Token Desain (CSS Custom Properties)

```css
:root {
  /* Palet Warna Latar */
  --bg-canvas: #f6f8fa;
  --bg-surface: #ffffff;
  --bg-code: #f3f4f6;
  --bg-hover: #eaeef2;

  /* Tipografi & Kontras */
  --text-main: #1f2328;
  --text-muted: #59636e;

  /* Border & Garis */
  --border-color: #d1d9e0;
  --border-subtle: #e1e4e8;

  /* Warna Aksen Fungsional */
  --accent-color: #0969da;      /* Biru standar web/GitHub */
  --accent-light: #ddf4ff;
  --success-color: #1a7f37;     /* Hijau status berhasil */
  --success-bg: #dafbe1;
  --error-color: #cf222e;       /* Merah status galat */
  --error-bg: #ffebe9;

  /* Font Stacks */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
```

---

## 3. Spesifikasi Komponen Semantik

### A. OpenUI `<tablist>`
* Menggunakan elemen semantik `div[role="tablist"]` dan `button[role="tab"]`.
* Indikator tab aktif ditandai secara presisi dengan border bawah `2px solid var(--accent-color)` dan ketebalan font `font-weight: 600`.
* Mendukung aksesibilitas keyboard (`aria-selected="true|false"` dan `aria-controls="panel-id"`).

### B. Raw Monospace Output Box
* Kotak berfont `ui-monospace` dengan background `#F3F4F6` dan padding terukur `16px`.
* Dirancang agar HR atau penilai dapat langsung mencocokkan teks output dengan contoh di email soal serta mempermudah pengambilan tangkapan layar (*screenshot*).
* Dilengkapi tombol satu klik **Copy Output** dengan umpan balik visual (*Copied to Clipboard!*).

### C. Sequence Evaluation Matrix (Task 1)
* Grid responsif berukuran kartu kompak untuk menginspeksi status setiap angka dari 100 turun ke 1.
* Menampilkan pembeda visual jelas:
  * Bilangan prima yang dieliminasi: dicoret (*strikethrough*) dengan teks redup.
  * `FooBar`: teks tebal warna merah arang (`#CF222E`).
  * `Foo`: teks tebal warna biru aksen (`#0969DA`).
  * `Bar`: teks tebal warna hijau hutan (`#1A7F37`).
* Dilengkapi kontrol toggle interaktif untuk melihat 25 bilangan prima yang dilewati.

### D. Daily Forecast Breakdown (Task 2)
* Tabel data tabular terstruktur dengan header berhuruf kapital kecil.
* Kolom terpisah untuk Tanggal Terformat (`Fri, 23 Apr 2021`), Suhu Presisi (`16.72°C`), Kondisi Cuaca, Waktu Pengambilan UTC, Kelembapan, dan Kecepatan Angin.
* Badge status cache cerdas: menampilkan **Cache HIT (<1ms)** atau **Fresh Fetch** untuk transparansi performa kepada reviewer.
