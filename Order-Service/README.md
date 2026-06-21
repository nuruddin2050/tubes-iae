# order-service 🚀

Ini project **order-service**. Gampangnya gini: ini kayak **kasir/penampung pesanan** buat website toko online.

Biar kebayang:
- User pesan barang ✅
- Sistem bikin “catatan pesanan” ✅
- Lalu sistem bilang ke sistem lain kalau pesanan sudah dibuat ✅

Di project ini ada 3 cara ngobrol ke sistem:
- **REST** (buat kirim data pakai HTTP) 🛣️
- **GraphQL** (cara ngobrol alternatif) 🗣️
- **RabbitMQ** (pesan “kode rahasia” supaya sistem lain tau kejadian) 📨

---

## 1) Yang dilakukan oleh order-service (super sederhana) 🤔

Alurnya begini:
1. Kamu **buat order** (pesan barang)
2. Sistem **cek produk** dulu ke *product-service* (biar barangnya beneran ada)
3. Sistem simpan order + detail barangnya ke database
4. Sistem kirim event ke **RabbitMQ** bilang: “order dibuat!”
5. Waktu **payment success** datang (dari RabbitMQ), status order berubah jadi **paid**

---

## 2) Yang harus disiapkan dulu (prasyarat) 🧰

Anggap ini kayak alat-alat sebelum demo:

- **PHP**
- **Composer** (buat install paket-paket project)
- **MySQL**
- **RabbitMQ** (bisa pakai yang asli atau pakai Docker)

Kalau semua ini siap, demo kamu bakal lancar 😄

---

## 3) Cara jalanin TANPA Docker (manual) 🧮

1. **Clone project**
   - `git clone ...`

2. **Masuk folder project**
   - `cd order-service`

3. **Install semua kebutuhan project** (biar library-nya kebaca)
   - `composer install`

4. **Copy file .env**
   - Copy `.env.example` (kalau ada) ke `.env`
   - atau copy `.env` yang sudah disiapkan

5. **Setting database**
   - Isi host, nama database, username, password di `.env`

6. **Buat tabel database**
   - `php artisan migrate`

7. **Jalankan server**
   - `php artisan serve`

Setelah itu REST API / GraphQL sudah bisa diakses.

---

## 4) Cara jalanin DENGAN Docker (lebih instan) ⚡

Kalau mau yang serba jalan otomatis:

1. Build + start semua service
   - `docker compose up --build`

2. Jalankan migrate di container app
   - `docker compose exec app php artisan migrate`

Selesai—tinggal demo aja 😎

---

## 5) Cara DEMO (yang paling penting) 🎯

### A) Buat Order (REST API) 🛒

1. Buka endpoint ini:
   - **POST** `/api/v1/orders`

2. Contoh body JSON (kira-kira seperti ini):

```json
{
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "product_name": "Product A",
      "price": 10000,
      "quantity": 2
    }
  ]
}
```

3. Jelasin ke dosen:
   - “Ini kayak kita **pesan barang**. Sistem simpan detail pesanan ke database.”

---

### B) Cek Data (pastikan order masuk) 👀

1. **GET** `/api/v1/orders`

2. Jelasin:
   - “Ini buat lihat daftar pesanan. Biar kelihatan data order dan order_items-nya ada.”

---

### C) Cek Log (pastikan proses jalan) 🧾

Perhatikan log yang muncul di terminal/server.
Yang wajib terlihat:
- `[order-service] product validated`
- `[order-service] publishing event order.created`

Jelasin simpel:
- “Sistem bilang: barang sudah dicek (validated), terus kirim event ke RabbitMQ.”

---

### D) Simulasi Pembayaran (RabbitMQ) 💸📨

1. Jalankan consumer:
   - `php artisan rabbitmq:consume-payment-success`

2. Kirim payload manual (contoh):

```json
{ "order_id": 1 }
```

3. Jelasin:
- “Ini kayak sistem pembayaran bilang: ‘udah sukses ya!’ ke order-service lewat RabbitMQ.”

---

### E) Hasil Akhir ✅

Cek order lagi.
Statusnya harus berubah jadi:
- **paid**

---

## 6) Demo GraphQL (cara ngobrol lain) 🗣️

1. Arahkan ke:
   - **POST** `/graphql`

2. Di GraphQL ada:
- Mutation `createOrder`
- Mutation `updateOrderStatus`

Jelasin simpel:
- “GraphQL itu cara ngobrol ke server yang lain (nggak cuma REST).”

---

## 7) Alur cerita biar dosen enak ngerti 📚

Narasi contoh:
1. User pesan barang
2. Sistem cek produk ke product-service (biar nggak ngarang barang)
3. Sistem simpan order + detail item
4. Sistem kirim event ke RabbitMQ: “order dibuat”
5. Payment-service kirim sinyal sukses lewat RabbitMQ
6. order-service ubah status order jadi **paid**

---

## 8) Penutup 🎉

Project ini sudah siap untuk demo:
- REST ✅
- GraphQL ✅
- RabbitMQ ✅
- Docker ✅

Semoga demo kamu lancar! 😄
