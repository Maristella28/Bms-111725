<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        \Log::info('AdminMiddleware: user', ['user' => $user]);

        if (!$user) {
            \Log::warning('AdminMiddleware: unauthenticated user');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'admin') {
            \Log::warning('AdminMiddleware: forbidden', [
                'user_id' => $user->id, 
                'role' => $user->role,
                'requested_url' => $request->fullUrl(),
                'requested_method' => $request->method()
            ]);
            return response()->json([
                'message' => 'Forbidden: Admins only',
                'error' => 'INSUFFICIENT_PERMISSIONS',
                'user_role' => $user->role,
                'required_role' => 'admin'
            ], 403);
        }

        return $next($request);
    }
}
