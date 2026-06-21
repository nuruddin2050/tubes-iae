<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\RabbitMQService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ConsumePaymentSuccess extends Command
{
    protected $signature = 'rabbitmq:consume-payment-success';
    protected $description = 'Consume payment.success messages and mark orders as paid.';

    public function __construct(
        private readonly RabbitMQService $rabbitMQService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $queueName = 'payment.success';

        $this->info('Starting RabbitMQ consumer for queue: ' . $queueName);

        $this->rabbitMQService->consume($queueName, function (array $payload) {
            Log::info('[order-service] payment.success received', $payload);

            $orderId = isset($payload['order_id']) ? (int) $payload['order_id'] : null;
            if (! $orderId) {
                Log::warning('[order-service] payment.success missing order_id', $payload);
                return;
            }

            $order = Order::find($orderId);
            if (! $order) {
                Log::warning('[order-service] payment.success order not found', [
                    'order_id' => $orderId,
                ]);
                return;
            }

            $order->status = 'paid';
            $order->save();

            Log::info('[order-service] order marked as paid', [
                'order_id' => $orderId,
            ]);
        });

        return 0;
    }
}



