<?php

namespace App\GraphQL\Resolvers;

use App\Services\OrderService;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class OrdersResolver
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {
    }

    /**
     * @return array<int, \App\Models\Order>
     */
    public function orders(): array
    {
        return $this->orderService->getAllOrders()->all();
    }

    public function order($root, array $args)
    {
        $id = (int) Arr::get($args, 'id');
        return $this->orderService->getOrderById($id);
    }

    public function createOrder($root, array $args)
    {
        $userId = (int) Arr::get($args, 'user_id');
        $items = Arr::get($args, 'items', []);

        /** @var Collection<int, array{product_id:int,product_name:string,price:numeric,quantity:int}> $normalizedItems */
        $normalizedItems = collect($items)->map(function ($item) {
            return [
                'product_id' => (int) $item['product_id'],
                'product_name' => (string) $item['product_name'],
                'price' => (float) $item['price'],
                'quantity' => (int) $item['quantity'],
            ];
        });

        $payload = [
            'user_id' => $userId,
            'items' => $normalizedItems->all(),
        ];

        return $this->orderService->createOrder($payload);
    }

    public function updateOrderStatus($root, array $args)
    {
        $id = (int) Arr::get($args, 'id');
        $status = (string) Arr::get($args, 'status');

        return $this->orderService->updateStatus($id, $status);
    }
}


