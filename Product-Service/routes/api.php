<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController; // Tambahkan ini

Route::apiResource('categories', CategoryController::class); // Tambahkan ini
Route::apiResource('products', ProductController::class);