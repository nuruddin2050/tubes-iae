# Product Service - BAJAMAS E-Commerce

Service ini bertanggung jawab untuk mengelola data produk dan kategori kemasan organik (REST API & GraphQL).

## Persyaratan
- Docker & Docker Compose

## Cara Menjalankan Project
1. Clone repository ini: `git clone <LINK_GITHUB_INI>`
2. Masuk ke folder: `cd product-service`
3. Copy `.env.example` menjadi `.env` dan sesuaikan konfigurasi database.
4. Jalankan container: `docker compose up -d`
5. Install dependensi: `docker exec -it bajamas_product_app composer install`
6. Jalankan migrasi dan seeder: `docker exec -it bajamas_product_app php artisan migrate:fresh --seed`

## Endpoint Tersedia
**REST API (Base URL: `http://localhost:8001/api`)**
- `GET /products` : Mendapatkan semua produk
- `GET /categories` : Mendapatkan semua kategori

**GraphQL (Base URL: `http://localhost:8001/graphql` - Method POST)**
Contoh Query:
```graphql
query {
  products {
    name
    price
    stock
  }
}