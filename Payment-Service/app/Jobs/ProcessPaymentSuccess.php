<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPaymentSuccess implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $payment;

    /**
     * Create a new job instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Di skenario microservice sungguhan, di sinilah kamu memanggil 
        // API Service Order untuk mengubah status pesanan.
        // Untuk simulasi tugas ini, kita catat saja ke dalam sistem log.
        
        Log::info('Message Broker API (Queue) Executed: Notifikasi pembayaran sukses untuk Order ID ' . $this->payment->order_id . ' telah dikirim ke Service Notifikasi dan Service Order.');
    }
}