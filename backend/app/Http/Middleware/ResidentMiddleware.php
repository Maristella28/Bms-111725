<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResidentMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        \Log::info('ResidentMiddleware: user', ['user' => $user]);

        if (!$user) {
            \Log::warning('ResidentMiddleware: unauthenticated user');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check if user is a resident (handle both 'resident' and 'residents' for backward compatibility)
        if ($user->role !== 'resident' && $user->role !== 'residents') {
            \Log::warning('ResidentMiddleware: forbidden', [
                'user_id' => $user->id, 
                'role' => $user->role,
                'requested_url' => $request->fullUrl(),
                'requested_method' => $request->method()
            ]);
            return response()->json([
                'message' => 'Forbidden: Residents only',
                'error' => 'INSUFFICIENT_PERMISSIONS',
                'user_role' => $user->role,
                'required_role' => 'resident'
            ], 403);
        }

        return $next($request);
    }
}
