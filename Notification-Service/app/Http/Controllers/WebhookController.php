<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    public function tangkapNotifikasi(Request $request)
    {
        // 1. Tangkap data pesanan baru yang dikirim oleh Hasura
        $pesanan = $request->input('event.data.new');

        if ($pesanan) {
            // 2. Buat otomatis pesan notifikasi untuk pelanggan
            DB::table('notifications')->insert([
                'user_id' => $pesanan['user_id'], // Diambil dari data pesanan
                'order_id' => $pesanan['id'],
                'title' => 'Pesanan Berhasil Dibuat! 🎉',
                'message' => 'Hore! Pesanan kardus BAJAMAS kamu dengan nomor tagihan #' . $pesanan['id'] . ' sedang menunggu pembayaran.',
                'is_read' => false, // Status awal belum dibaca
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['status' => 'sukses', 'pesan' => 'Notifikasi terkirim!']);
        }

        return response()->json(['status' => 'gagal', 'pesan' => 'Data tidak ditemukan'], 400);
    }
}