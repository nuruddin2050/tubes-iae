<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/validate-token', [AuthController::class, 'validateToken']);
    });

    Route::prefix('users')->group(function () {

        Route::get('/', [UserController::class, 'index']);

        Route::get('/{id}', [UserController::class, 'show']);

        Route::put('/{id}', [UserController::class, 'update']);

        Route::delete('/{id}', [UserController::class, 'destroy']);
    });
});
