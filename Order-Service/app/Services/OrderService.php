<?php

namespace App\Services;


use App\Models\Order;
use App\Services\RabbitMQService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class OrderService
{
    public function __construct(
        private readonly RabbitMQService $rabbitMQService,
    ) {
    }

    public function createOrder(array $payload): Order
    {
        return DB::transaction(function () use ($payload) {

            $orderCode = $this->generateUniqueOrderCode();

            $items = $payload['items'] ?? [];

            $orderSubtotal = 0.0;
            $orderItems = [];

            foreach ($items as $item) {
                $productId = (int) $item['product_id'];

                try {
                    $productServiceBaseUri = (string) env('SERVICES_PRODUCT_SERVICE_BASE_URI');

                    if (!empty($productServiceBaseUri)) {
                        $response = Http::timeout(2)->get($productServiceBaseUri . '/api/products/' . $productId);

                        if ($response->successful() && !empty($response->json())) {
                            Log::info('[order-service] product validated', ['product_id' => $productId]);
                        } else {
                            Log::warning('[order-service] product validation failed, fallback used');
                        }
                    } else {
                        Log::warning('[order-service] product service not configured, skipping validation');
                    }

                } catch (\Throwable $e) {
                    Log::warning('[order-service] product service unreachable, skipping validation');
                }



                $price = (float) $item['price'];
                $quantity = (int) $item['quantity'];
                $itemSubtotal = $price * $quantity;

                $orderSubtotal += $itemSubtotal;

                $orderItems[] = [
                    'product_id' => $productId,
                    'product_name' => (string) $item['product_name'],
                    'price' => $price,
                    'quantity' => $quantity,
                    'subtotal' => $itemSubtotal,
                ];
            }


            $order = Order::create([
                'order_code' => $orderCode,
                'user_id' => $payload['user_id'],
                'status' => 'pending',
                'subtotal' => $this->roundMoney($orderSubtotal),
                'total_price' => $this->roundMoney($orderSubtotal),
            ]);

            $order->items()->createMany($orderItems);

            Log::info('[order-service] publishing event order.created', [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
            ]);

            foreach ($order->items as $orderItem) {
                $this->rabbitMQService->publish(
                    exchange: 'order.exchange',
                    routingKey: 'order.created',
                    payload: [
                        'order_id' => (int) $order->id,
                        'product_id' => (int) $orderItem->product_id,
                        'quantity' => (int) $orderItem->quantity,
                    ],
                );
            }

            return $order->load('items');

        });
    }

    public function getAllOrders(): EloquentCollection
    {
        return Order::with('items')->latest()->get();
    }

    public function getOrderById(int $id): Order
    {
        return Order::with('items')->findOrFail($id);
    }

    public function getOrdersByUser(string $userId): EloquentCollection
    {
        return Order::with('items')
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function updateStatus(int $id, string $status): Order
    {
        $allowedStatuses = [
            'pending',
            'paid',
            'processing',
            'shipped',
            'completed',
            'cancelled'
        ];

        if (!in_array($status, $allowedStatuses, true)) {
            throw new \InvalidArgumentException('Invalid status.');
        }

        return DB::transaction(function () use ($id, $status) {
            $order = Order::findOrFail($id);
            $order->status = $status;
            $order->save();

            return $order->load('items');
        });
    }

    public function deleteOrder(int $id): void
    {
        DB::transaction(function () use ($id) {
            $order = Order::findOrFail($id);
            $order->delete();
        });
    }

    public function getHistory(string $userId): EloquentCollection
    {
        return Order::with('items')
            ->where('user_id', $userId)
            ->whereIn('status', [
                'pending',
                'paid',
                'processing',
                'shipped',
                'completed',
                'cancelled'
            ])
            ->orderByDesc('created_at')
            ->get();
    }

    private function generateUniqueOrderCode(): string
    {
        do {
            $code = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(10));
        } while (Order::query()->where('order_code', $code)->exists());

        return $code;
    }

    private function roundMoney(float $amount): float
    {
        return round($amount, 2);
    }
}
