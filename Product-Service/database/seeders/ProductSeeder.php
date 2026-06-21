<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori Dummy
        $cat1 = Category::create([
            'name' => 'Kemasan Kertas',
            'slug' => 'kemasan-kertas',
            'description' => 'Kemasan ramah lingkungan berbahan kertas daur ulang'
        ]);

        $cat2 = Category::create([
            'name' => 'Kemasan Singkong',
            'slug' => 'kemasan-singkong',
            'description' => 'Kantong nabati berbahan dasar pati singkong yang mudah terurai'
        ]);

        // 2. Buat Produk Dummy
        Product::create([
            'category_id' => $cat1->id,
            'name' => 'Paper Bag Polos Craft M',
            'slug' => 'paper-bag-polos-craft-m-' . rand(1000,9999),
            'description' => 'Paper bag ramah lingkungan cocok untuk boks makanan',
            'price' => 1500,
            'stock' => 200
        ]);

        Product::create([
            'category_id' => $cat2->id,
            'name' => 'Bio-Plastic Bag Singkong L',
            'slug' => 'bio-plastic-bag-singkong-l-' . rand(1000,9999),
            'description' => 'Kantong alternatif plastik dari pati singkong isi 50 lembar',
            'price' => 35000,
            'stock' => 100
        ]);
        
        Product::create([
            'category_id' => $cat1->id,
            'name' => 'Kardus Corrugated Box S',
            'slug' => 'kardus-corrugated-box-s-' . rand(1000,9999),
            'description' => 'Kardus pengiriman ukuran kecil yang aman dan bisa didaur ulang',
            'price' => 2500,
            'stock' => 500
        ]);
    }
}