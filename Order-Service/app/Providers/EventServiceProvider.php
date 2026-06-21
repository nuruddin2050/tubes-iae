<?php

namespace App\Providers;

use App\Events\OrderCreated;
use App\Listeners\PublishOrderCreatedListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderCreated::class => [
            PublishOrderCreatedListener::class,
        ],
    ];
}

