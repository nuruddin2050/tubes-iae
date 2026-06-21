<?php

namespace App\Jobs;

use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Queue\QueueableCollection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Variabel untuk menampung data yang dikirim dari service lain
    public $data;

    /**
     * Create a new job instance.
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // 1. Log ke terminal/file log Laravel buat bukti kalau data berhasil masuk dari Redis
        Log::info('Menerima antrean notifikasi baru:', $this->data);

        // 2. Simpan data notifikasi tersebut ke databasemu sendiri
        Notification::create([
            'user_id' => $this->data['user_id'] ?? 'GUEST',
            'email'   => $this->data['email'] ?? 'unknown@mail.com',
            'type'    => $this->data['type'] ?? 'GENERAL',
            'message' => $this->data['message'] ?? 'Tidak ada pesan.',
            'status'  => 'sent', // Anggap saja langsung sukses terkirim
        ]);

        Log::info('Notifikasi berhasil disimpan ke database!');
    }
}