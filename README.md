# Stamps Technical Assessment — Section A (Mini Test)

Repositori ini berisi solusi lengkap untuk **Section A (Mini Test)** rekrutmen Developer di **Stamps (`stamps.id`)**, dikerjakan oleh **Arya Rezza Anantya**. Solusi ini dirancang menggunakan arsitektur **Fullstack TypeScript (Hono + React 19 OpenUI)** dengan kepatuhan penuh terhadap prinsip **SOLID**, ketahanan skalabilitas tinggi (*high concurrency & request coalescing*), cakupan pengujian otomatis bertingkat (**Unit, Integration, E2E Playwright**), serta pipeline CI/CD otomatis ke **Microsoft Azure Container Apps**.

---

## 1. Live Production & Status Deployment

| Layanan | URL / Keterangan |
|---|---|
| **Live Web App (Azure Container Apps)** | [https://stamps-mini-test.icycliff-8b54ce53.malaysiawest.azurecontainerapps.io](https://stamps-mini-test.icycliff-8b54ce53.malaysiawest.azurecontainerapps.io) |
| **API Health & Cache Metrics** | [https://stamps-mini-test.icycliff-8b54ce53.malaysiawest.azurecontainerapps.io/api/health](https://stamps-mini-test.icycliff-8b54ce53.malaysiawest.azurecontainerapps.io/api/health) |
| **GitHub Repository (Public)** | [https://github.com/anantyan/stamps-mini-test](https://github.com/anantyan/stamps-mini-test) |
| **Cloud Infrastructure** | Azure Container Apps (`cae-nodewave-taskflow`, Region: `Malaysia West`) |

---

## 2. Ringkasan Tugas & Solusi Algoritma

### A. Mini Test 1: Small Program (100 to 1, Non-Prime, FooBar)
* **Aturan #1 (Eliminasi Bilangan Prima)**: Angka prima ($n > 1$ dengan pembagi positif hanya $1$ dan dirinya sendiri) **dilewati sepenuhnya** dan tidak dicetak. Angka $2, 3, 5, 7, \dots, 97$ dieliminasi (bahkan angka $3$ dan $5$ tidak dicetak sebagai `Foo` atau `Bar`).
* **Aturan #2, #3, #4 (Substitusi Modulo)**:
  * Kelipatan $3$ dan $5$ ($n \pmod{15} = 0$) $\to$ dicetak `"FooBar"`.
  * Kelipatan $3$ ($n \pmod 3 = 0$) $\to$ dicetak `"Foo"`.
  * Kelipatan $5$ ($n \pmod 5 = 0$) $\to$ dicetak `"Bar"`.
* **Kasus Batas (*Edge Cases*)**:
  * Angka $1$ **bukan prima** ($n \le 1$), sehingga tetap dicetak sebagai `"1"` di urutan paling akhir.
  * Angka $91$ adalah bilangan komposit ($7 \times 13$), sehingga tetap dicetak sebagai `"91"`.
* **Aturan #5 (Format Horizontal)**: Seluruh angka yang lolos digabungkan dalam satu baris dengan pemisah koma dan spasi (`", "`).
* **Output Teks**:
  ```text
  Bar, Foo, 98, Foo, Bar, 94, Foo, 92, 91, FooBar, 88, Foo, 86, Bar, Foo, 82, Foo, Bar, Foo, 77, 76, FooBar, 74, Foo, Bar, Foo, 68, Foo, Bar, 64, Foo, 62, FooBar, 58, Foo, 56, Bar, Foo, 52, Foo, Bar, 49, Foo, 46, FooBar, 44, Foo, Bar, Foo, 38, Foo, Bar, 34, Foo, 32, FooBar, 28, Foo, 26, Bar, Foo, 22, Foo, Bar, Foo, 16, FooBar, 14, Foo, Bar, Foo, 8, Foo, 4, 1
  ```
  *(Total: 75 angka tercetak, 25 bilangan prima dilewati).*

---

### B. Mini Test 2: Jakarta 5-Day Weather Forecast & High Concurrency
* **Endpoint Sumber**: OpenWeatherMap API 5 Day / 3 Hour Forecast (`api.openweathermap.org/data/2.5/forecast?q=Jakarta,ID&units=metric`).
* **Aturan #3 (Deduplikasi 1 Suhu per Hari)**: Dari $40$ data poin interval 3 jam, sistem mengelompokkan berdasarkan tanggal kalender lokal Jakarta (WIB / UTC+7) dan memprioritaskan titik pengukuran tengah hari (`12:00:00 UTC` / siang) untuk mewakili hari tersebut secara stabil.
* **Format Tanggal & Suhu Presisi**:
  ```text
  Weather Forecast:
  Fri, 06 Nov 2026: 31.25°C
  Sat, 07 Nov 2026: 34.92°C
  Sun, 08 Nov 2026: 33.57°C
  Mon, 09 Nov 2026: 31.41°C
  Tue, 10 Nov 2026: 31.60°C
  Wed, 11 Nov 2026: 31.78°C
  ```
* **Aturan #5 (Keamanan API Key)**: Kunci API **tidak pernah di-hardcode** di client browser. API Key disimpan murni di sisi backend proxy melalui `.env` server.

---

## 3. Skalabilitas & Concurrency: Proteksi Anti-Rate-Limit

Akun gratis OpenWeatherMap dibatasi $60\text{ request/menit}$. Untuk menjamin aplikasi dapat diakses oleh ribuan pengguna secara bersamaan tanpa lonjakan latensi atau penolakan HTTP `429 Too Many Requests`, backend mengimplementasikan arsitektur proteksi ganda:

1. **In-Memory Cache dengan TTL (15 Menit)**:
   * Data ramalan cuaca 5 hari tidak berubah setiap detik. Hasil panggilan pertama disimpan dalam memori selama 15 menit. Panggilan berikutnya dijawab instan dalam tempo $< 1\text{ ms}$.
2. **Single-Flight Request Coalescing (Anti-Cache Stampede)**:
   * Jika $1.000$ request datang secara bersamaan saat cache dingin (*cold cache*), sistem mengunci *inflight promise*. Hanya **1 request** yang memanggil OpenWeatherMap API; $999$ request lainnya menunggu promise yang sama.
3. **Stale-While-Revalidate Fallback**:
   * Jika jaringan luar atau OpenWeatherMap mengalami kegagalan/timeout, backend menyajikan data cache terakhir (*stale*) sehingga aplikasi tetap dapat diakses tanpa menghasilkan error 500.

---

## 4. Kepatuhan Prinsip SOLID

* **S (Single Responsibility Principle)**: `FooBarService` khusus logika angka, `OpenWeatherProvider` khusus HTTP transport, `WeatherService` khusus agregasi & formatting, `MemoryCacheService` khusus caching & coalescing.
* **O (Open/Closed Principle)**: `WeatherService` mengonsumsi kontrak interface `IWeatherProvider`. Menambahkan provider baru (misal BMKG atau Mock) tidak memerlukan modifikasi kode inti service.
* **L (Liskov Substitution Principle)**: `MockWeatherProvider` dapat disubstitusikan ke dalam `WeatherService` pada test suite tanpa mengubah perilaku bisnis.
* **I (Interface Segregation Principle)**: Kontrak interface dipecah menjadi unit-unit terpisah yang ramping (`IFooBarService`, `IWeatherProvider`, `ICacheManager`).
* **D (Dependency Inversion Principle)**: Controller dan CLI bergantung pada abstraksi interface yang diinjeksi melalui *dependency injection*.

---

## 5. Panduan Menjalankan Proyek (Untuk Reviewer / Tester)

### Prasyarat
* Node.js v20+ atau v22+
* npm

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/anantyan/stamps-mini-test.git
cd stamps-mini-test
```

### Langkah 2: Setup Environment
Salin template `.env.example` menjadi `.env` dan masukkan API Key OpenWeatherMap Anda:
```bash
cp .env.example .env
```
Isi file `.env`:
```env
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
PORT=3001
NODE_ENV=development
```

### Langkah 3: Install Dependencies
```bash
npm install
```

### Langkah 4: Menjalankan Eksekusi

#### A. Eksekusi CLI Terminal (Murni Teks Sesuai Contoh Email)
```bash
npm run cli
```

#### B. Menjalankan Web UI + API Server (Lokal)
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (Vite Client) atau `http://localhost:3001` (Hono Server).

---

## 6. Pengujian Otomatis (Testing Suite)

Proyek ini dilengkapi suite pengujian bertingkat dengan **100% tingkat kelulusan**:

### 1. Menjalankan Unit & Integration Tests (Vitest)
```bash
npm test
```
* `foobar.service.test.ts`: Uji kasus batas keprimaan ($1, 2, 3, 5, 91, 97$), hierarki substitusi modulo, dan panjang string.
* `weather.service.test.ts`: Uji transformasi 40 titik data menjadi 1 suhu per hari, format `Fri, 23 Apr 2021: 16.72°C`.
* `cache.service.test.ts`: Uji konkurensi (50 request serentak hanya memicu 1 pemanggilan provider) dan fallback data stale.
* `api.test.ts`: Uji HTTP endpoint `/api/task-1`, `/api/task-2`, `/api/health`, dan security headers.

### 2. Menjalankan E2E Tests (Playwright)
```bash
npm run test:e2e
```
Menguji navigasi tab OpenUI, visual output raw, toggle inspeksi matriks bilangan prima, tombol copy clipboard, dan rendering tabel prakiraan cuaca pada browser Chromium dan Mobile viewport.

---

## 7. Arsitektur Antarmuka Web (OpenUI Anti-AI Standard)

Antarmuka web dirancang mengacu pada dokumen [`DESIGN.md`](./DESIGN.md):
* **Natural Utilitarian**: Tanpa gradien neon atau ornamen kosmetik khas generator AI; kanvas abu-abu lembut `#F6F8FA` dengan kontainer kartu berbatas tajam `1px solid #D1D9E0`.
* **OpenUI Semantics**: Menggunakan `role="tablist"`, `role="tab"`, dan `role="tabpanel"`.
* **Raw Output Panel**: Kotak `monospace` terformat untuk memudahkan HR mengambil tangkapan layar (*screenshot*) dan mencocokkan hasil teks.
* **Tester Key Override**: Disediakan drawer opsional di UI jika penguji ingin mencoba menggunakan API Key milik mereka sendiri secara langsung dari antarmuka web.
