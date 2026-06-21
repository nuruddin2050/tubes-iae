<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\RabbitMQService;

class PublishOrderCreatedListener
{
    public function __construct(
        private readonly RabbitMQService $rabbitMQService,
    ) {
    }

    public function handle(OrderCreated $event): void
    {
        $this->rabbitMQService->publishJson('order.created', [
            'order_id' => $event->orderId,
            'order_code' => $event->orderCode,
            'user_id' => $event->userId,
            'total_price' => $event->totalPrice,
            'status' => $event->status,
        ]);
    }
}

