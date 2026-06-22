<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Jobs\ProcessPaymentSuccess;

class PaymentController extends Controller
{
    // Endpoint untuk memproses pembayaran baru
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|integer',
            'user_id' => 'required|integer',
            'amount' => 'required|numeric',
            'payment_method' => 'required|string'
        ]);

        // Menyimpan data ke database
        $payment = Payment::create([
            'order_id' => $request->order_id,
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'status' => 'success'
        ]);

        // Mengirim pesan ke Queue (Message Broker)
        ProcessPaymentSuccess::dispatch($payment);

        return response()->json([
            'message' => 'Pembayaran berhasil diproses',
            'data' => $payment
        ], 201);
    }

    // Endpoint untuk mengecek status pembayaran berdasarkan order_id
    public function show($order_id)
    {
        $payment = Payment::where('order_id', $order_id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Data pembayaran tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail pembayaran',
            'data' => $payment
        ], 200);
    }
}