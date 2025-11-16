<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class PerformanceMonitoring
{
    /**
     * Handle an incoming request and monitor performance
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);
        
        // Process the request
        $response = $next($request);
        
        // Calculate metrics
        $duration = microtime(true) - $startTime;
        $memoryUsed = memory_get_usage(true) - $startMemory;
        $peakMemory = memory_get_peak_usage(true);
        
        // Log slow requests
        if ($duration > 2.0) {
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'duration_seconds' => round($duration, 3),
                'memory_used_mb' => round($memoryUsed / 1024 / 1024, 2),
                'peak_memory_mb' => round($peakMemory / 1024 / 1024, 2),
                'user_id' => $request->user()?->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        }
        
        // Log high memory usage
        if ($memoryUsed > 50 * 1024 * 1024) { // 50MB
            Log::warning('High memory usage detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'memory_used_mb' => round($memoryUsed / 1024 / 1024, 2),
                'peak_memory_mb' => round($peakMemory / 1024 / 1024, 2),
                'user_id' => $request->user()?->id
            ]);
        }
        
        // Add performance headers
        $response->headers->set('X-Response-Time', round($duration * 1000, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', round($memoryUsed / 1024 / 1024, 2) . 'MB');
        $response->headers->set('X-Peak-Memory', round($peakMemory / 1024 / 1024, 2) . 'MB');
        
        return $response;
    }
}
