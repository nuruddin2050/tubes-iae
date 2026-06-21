<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly string $orderCode,
        public readonly int $userId,
        public readonly float $totalPrice,
        public readonly string $status,
    ) {
    }

    public static function fromOrder(Order $order): self
    {
        return new self(
            orderId: (int) $order->id,
            orderCode: (string) $order->order_code,
            userId: (int) $order->user_id,
            totalPrice: (float) $order->total_price,
            status: (string) $order->status,
        );
    }
}

