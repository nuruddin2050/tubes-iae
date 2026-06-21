<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    // Mengizinkan kolom ini diisi saat insert/update
    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'stock'];

    // Relasi: Produk ini dimiliki oleh sebuah kategori
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}