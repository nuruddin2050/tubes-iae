<?php

use App\Http\Controllers\Api\V1\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/user/{userId}', [OrderController::class, 'userOrders']);

    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);


    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    Route::get('/orders/history/{userId}', [OrderController::class, 'history']);
});

