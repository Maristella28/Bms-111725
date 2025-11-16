<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        \Log::info('StaffMiddleware: user', ['user' => $user]);

        if (!$user) {
            \Log::warning('StaffMiddleware: unauthenticated user');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Check if user is staff (admin also has access to staff routes)
        if ($user->role !== 'staff' && $user->role !== 'admin') {
            \Log::warning('StaffMiddleware: forbidden', [
                'user_id' => $user->id, 
                'role' => $user->role,
                'requested_url' => $request->fullUrl(),
                'requested_method' => $request->method()
            ]);
            return response()->json([
                'message' => 'Forbidden: Staff and Admin only',
                'error' => 'INSUFFICIENT_PERMISSIONS',
                'user_role' => $user->role,
                'required_role' => 'staff'
            ], 403);
        }

        return $next($request);
    }
}
