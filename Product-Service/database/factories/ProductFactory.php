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
        $name = $this->faker->randomElement([
            'Kardus Box Corrugated', 'Paper Bag Kraft Lipat', 'Sack Kertas Semen Eco', 
            'Solatip Selulosa Kertas', 'Honeycomb Paper Wrap', 'Biodegradable Bubble Wrap',
            'Tas Singkong Organik', 'Kotak Dus Duplex Foodgrade'
        ]) . ' ' . $this->faker->randomElement(['S', 'M', 'L', 'XL']);

        $category = \App\Models\Category::inRandomOrder()->first();
        $categoryId = $category ? $category->id : 1;

        return [
            'category_id' => $categoryId,
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->paragraph(2),
            'price' => $this->faker->numberBetween(1500, 45000),
            'stock' => $this->faker->numberBetween(10, 500),
        ];
    }
}