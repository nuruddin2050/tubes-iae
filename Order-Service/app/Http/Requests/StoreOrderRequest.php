<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'string'],
            'items' => ['required', 'array'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.product_name' => ['required', 'string'],
            'items.*.price' => ['required', 'numeric'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}

