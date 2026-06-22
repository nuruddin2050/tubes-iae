<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\Category::create([
            'name' => 'Kemasan Kertas',
            'slug' => 'kemasan-kertas',
            'description' => 'Kemasan ramah lingkungan berbahan kertas daur ulang'
        ]);

        \App\Models\Category::create([
            'name' => 'Kemasan Singkong',
            'slug' => 'kemasan-singkong',
            'description' => 'Kantong nabati berbahan dasar pati singkong yang mudah terurai'
        ]);

        \App\Models\Category::create([
            'name' => 'Kemasan Bambu & Kayu',
            'slug' => 'kemasan-bambu-kayu',
            'description' => 'Wadah premium estetis berbahan bambu dan serat kayu alami'
        ]);

        \App\Models\Product::factory(50)->create();
    }
}