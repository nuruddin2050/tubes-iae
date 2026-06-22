<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\API\PaymentController;

// Rute untuk mengecek status server
Route::get('/ping', function () {
    return response()->json(['message' => 'Payment Service is running!']);
});

// Rute untuk fitur pembayaran
Route::post('/payments', [PaymentController::class, 'store']);
Route::get('/payments/{order_id}', [PaymentController::class, 'show']);

use App\Http\Controllers\WebhookController;

Route::post('/webhook/pesanan-baru', [WebhookController::class, 'tangkapPesananBaru']);
