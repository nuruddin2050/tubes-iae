<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('notifications', function (Blueprint $table) {
        $table->id();
        $table->string('user_id'); // Untuk tahu notifikasi ini milik siapa
        $table->string('email');   // Email tujuan notifikasi
        $table->string('type');    // Tipe: 'WELCOME', 'ORDER_CREATED', atau 'PAYMENT_SUCCESS'
        $table->text('message');   // Isi pesan notifikasinya
        $table->string('status')->default('sent'); // Status pengiriman
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
