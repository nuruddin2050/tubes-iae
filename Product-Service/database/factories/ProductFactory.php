<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
{
    return [
        'name' => $this->faker->randomElement([
            'Kardus Box Corrugated', 'Paper Bag Kraft Lipat', 'Sack Kertas Semen Eco', 
            'Solatip Selulosa Kertas', 'Honeycomb Paper Wrap', 'Biodegradable Bubble Wrap',
            'Tas Singkong Organik', 'Kotak Dus Duplex Foodgrade'
        ]) . ' ' . $this->faker->randomElement(['S', 'M', 'L', 'XL']), // Membuat nama bervariasi ukuran
        
        'price' => $this->faker->numberBetween(1500, 45000), // Harga acak antara Rp 1.500 - Rp 45.000
        'stock' => $this->faker->numberBetween(10, 500),    // Stok acak antara 10 - 500 pcs
        'category' => $this->faker->randomElement(['Kardus', 'Kantong', 'Perekat', 'Pelindung']),
    ];
}
}