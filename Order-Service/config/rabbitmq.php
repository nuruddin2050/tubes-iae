<?php

return [
    'host' => env('RABBITMQ_HOST', '127.0.0.1'),
    'port' => (int) env('RABBITMQ_PORT', 5672),
    'user' => env('RABBITMQ_USER', 'guest'),
    'password' => env('RABBITMQ_PASSWORD', 'guest'),
    'vhost' => env('RABBITMQ_VHOST', '/'),

    'exchange' => [
        'name' => 'order.exchange',
        'type' => env('RABBITMQ_EXCHANGE_TYPE', 'direct'),
        'durable' => true,
    ],

    'queues' => [
        'order.created' => [
            'name' => 'order.created',
            'routing_key' => 'order.created',
        ],
        'payment.success' => [
            'name' => 'payment.success',
            'routing_key' => 'payment.success',
        ],
    ],
];

