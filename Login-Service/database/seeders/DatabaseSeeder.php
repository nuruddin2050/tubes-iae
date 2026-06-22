<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Perintah ini akan membuat 10 data pelanggan secara acak
        User::factory(10)->create();

        // 2. Perintah ini membuat 1 akun spesifik yang bisa kamu pakai untuk testing login
        User::factory()->create([
            'name' => 'Admin Bajamas',
            'email' => 'admin@bajamas.com',
        ]);
    }
}