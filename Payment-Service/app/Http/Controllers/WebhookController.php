<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    public function tangkapPesananBaru(Request $request)
    {
        // 1. Hasura akan mengirimkan payload JSON. Kita ambil data pesanan barunya.
        $pesanan = $request->input('event.data.new');

        if ($pesanan) {
            // 2. Buat otomatis catatan tagihan di tabel payments
            DB::table('payments')->insert([
                'order_id' => $pesanan['id'],
                'amount' => $pesanan['total_price'],
                'payment_method' => 'qris', // Kita buat default QRIS untuk simulasi
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['status' => 'sukses', 'pesan' => 'Tagihan berhasil dibuat!']);
        }

        return response()->json(['status' => 'gagal', 'pesan' => 'Data tidak ditemukan'], 400);
    }
}