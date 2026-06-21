<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    // Daftarkan kolom yang boleh diisi secara massal
    protected $fillable = [
        'user_id',
        'email',
        'type',
        'message',
        'status',
    ];
}