<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory; // <-- Ini baris ajaib yang menyelesaikan error-nya

    protected $guarded = []; // Tambahan agar kita bebas memasukkan data apa saja

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}