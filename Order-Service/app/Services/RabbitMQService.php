<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;


use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Message\AMQPMessage;

// Ensure compatibility with php-amqplib on some PHP versions.
if (! defined('PHP_VERSION_ID') || ! defined('SOCKET_EAGAIN')) {
    // These constants exist in the PHP sockets extension on most systems.
    define('SOCKET_EAGAIN', 11);
    if (! defined('SOCKET_EWOULDBLOCK')) {
        define('SOCKET_EWOULDBLOCK', 11);
    }

    // php-amqplib expects SOCKET_EINTR to exist.
    if (! defined('SOCKET_EINTR')) {
        define('SOCKET_EINTR', 4);
    }
}


class RabbitMQService
{
    /** @var AMQPStreamConnection|null */
    private ?AMQPStreamConnection $connection = null;

    /** @var AMQPChannel|null */
    private ?AMQPChannel $channel = null;

    public function __construct()
    {
        // Lazy connection: avoid failing artisan commands that don't need RabbitMQ.
        // Keep properties nullable to prevent typed-property TypeError during app bootstrapping.

        $host = (string) config('rabbitmq.host');
        $port = (int) config('rabbitmq.port');
        $user = (string) config('rabbitmq.user');
        $password = (string) config('rabbitmq.password');
        $vhost = (string) config('rabbitmq.vhost');

        try {
            $this->connection = new AMQPStreamConnection($host, $port, $user, $password, $vhost);
            $this->channel = $this->connection->channel();

            $this->declareTopology();
        } catch (\Throwable $e) {
            \Log::error('[rabbitmq] connection failed', [
                'message' => $e->getMessage(),
            ]);

            $this->connection = null;
            $this->channel = null;
        }
    }


    public function __destruct()
    {
        try {
            $this->channel->close();
        } catch (\Throwable) {
            // ignore
        }

        try {
            $this->connection->close();
        } catch (\Throwable) {
            // ignore
        }
    }

    public function publish(string $exchange, string $routingKey, array $payload): void
    {
        if ($this->channel === null) {
            \Log::warning('[rabbitmq] publish skipped because channel is null');

            return;
        }

        $message = new AMQPMessage(
            json_encode($payload, JSON_UNESCAPED_SLASHES),
            [
                'content_type' => 'application/json',
                'delivery_mode' => 2,
            ]
        );

        try {
            $this->channel->basic_publish($message, $exchange, $routingKey);
        } catch (\Throwable $e) {
            Log::warning('[rabbitmq] publish failed but ignored', [
                'error' => $e->getMessage()
            ]);
        }

    }

    public function publishJson(string $routingKey, array $payload): void
    {
        $exchange = config('rabbitmq.exchange.name');

        $this->publish($exchange, $routingKey, $payload);
    }


    public function consume(string $queueName, callable $onMessage, string $consumerTag = ''): void
    {
        $callback = function ($msg) use ($onMessage) {
            $body = $msg->getBody();
            $data = json_decode($body, true);

            if (! is_array($data)) {
                $msg->ack();
                return;
            }

            $onMessage($data);
            $msg->ack();
        };

        $this->channel->basic_consume(
            queue: $queueName,
            consumer_tag: $consumerTag,
            no_local: false,
            no_ack: false,
            exclusive: false,
            nowait: false,
            callback: $callback
        );

        while (true) {
            $this->channel->wait();
        }
    }

    private function declareTopology(): void
    {
        $exchangeName = config('rabbitmq.exchange.name');
        $exchangeType = Arr::get(config('rabbitmq.exchange.type'), 'direct');
        $durable = (bool) config('rabbitmq.exchange.durable', true);

        $this->channel->exchange_declare(
            $exchangeName,
            $exchangeType,
            false,
            $durable,
            false
        );

        foreach (array_keys(config('rabbitmq.queues', [])) as $routingKey) {
            $queueName = config('rabbitmq.queues.' . $routingKey . '.name');

            $this->channel->queue_declare(
                queue: $queueName,
                passive: false,
                durable: true,
                exclusive: false,
                auto_delete: false
            );

            $this->channel->queue_bind(
                queue: $queueName,
                exchange: $exchangeName,
                routing_key: $routingKey
            );
        }
    }
}
