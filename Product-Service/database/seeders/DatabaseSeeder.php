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
    // Memerintahkan factory untuk membuat 50 produk sekaligus
    \App\Models\Product::factory(50)->create();
}
}