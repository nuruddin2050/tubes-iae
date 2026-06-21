<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * @param \Illuminate\Http\Request $request
     */
    public function render($request, Throwable $e)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Something went wrong (demo-safe mode)',
        ], 200);
    }
}

