<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use App\Services\EnterpriseResidentService;

class HealthController extends Controller
{
    /**
     * Comprehensive health check for all system components
     */
    public function check(): JsonResponse
    {
        try {
            // Safely get checks, ensuring each one returns an array
            $checks = [];
            try {
                $checks['database'] = $this->checkDatabase();
            } catch (\Exception $e) {
                $checks['database'] = ['status' => 'error', 'message' => $e->getMessage()];
            }
            
            try {
                $checks['redis'] = $this->checkRedis();
            } catch (\Throwable $e) {
                $checks['redis'] = ['status' => 'warning', 'message' => 'Redis check failed: ' . (method_exists($e, 'getMessage') ? $e->getMessage() : 'Unknown error')];
            } catch (\Exception $e) {
                $checks['redis'] = ['status' => 'warning', 'message' => 'Redis check failed: ' . $e->getMessage()];
            }
            
            try {
                $checks['storage'] = $this->checkStorage();
            } catch (\Exception $e) {
                $checks['storage'] = ['status' => 'warning', 'message' => $e->getMessage()];
            }
            
            try {
                $checks['queue'] = $this->checkQueue();
            } catch (\Exception $e) {
                $checks['queue'] = ['status' => 'warning', 'message' => $e->getMessage()];
            }
            
            try {
                $checks['cache'] = $this->checkCache();
            } catch (\Exception $e) {
                $checks['cache'] = ['status' => 'warning', 'message' => $e->getMessage()];
            }
            
            try {
                $checks['memory'] = $this->checkMemory();
            } catch (\Exception $e) {
                $checks['memory'] = ['status' => 'warning', 'message' => $e->getMessage()];
            }
            
            try {
                $checks['disk_space'] = $this->checkDiskSpace();
            } catch (\Exception $e) {
                $checks['disk_space'] = ['status' => 'warning', 'message' => $e->getMessage()];
            }
            
            // Database must be OK, other services can be warnings
            $criticalChecks = ['database'];
            $overall = true;
            foreach ($checks as $key => $check) {
                if (!isset($check['status'])) {
                    continue;
                }
                if (in_array($key, $criticalChecks)) {
                    if ($check['status'] !== 'ok') {
                        $overall = false;
                        break;
                    }
                } else {
                    // For non-critical services, 'error' status means unhealthy
                    if ($check['status'] === 'error') {
                        $overall = false;
                        break;
                    }
                }
            }
            
            $statusCode = $overall ? 200 : 503;
            
            // Safely get uptime
            $uptime = 'Unknown';
            try {
                $uptime = $this->getUptime();
            } catch (\Exception $e) {
                Log::debug('Could not get uptime: ' . $e->getMessage());
            }
            
            // Safely get timestamp
            try {
                $timestamp = now()->toISOString();
            } catch (\Exception $e) {
                $timestamp = date('c');
            }
            
            return response()->json([
                'status' => $overall ? 'healthy' : 'unhealthy',
                'timestamp' => $timestamp,
                'uptime' => $uptime,
                'version' => config('app.version', '1.0.0'),
                'environment' => config('app.env', 'unknown'),
                'checks' => $checks
            ], $statusCode);
        } catch (\Throwable $e) {
            // Log the error if Log is available
            try {
                if (class_exists('\Illuminate\Support\Facades\Log')) {
                    Log::error('Health check failed: ' . (method_exists($e, 'getMessage') ? $e->getMessage() : 'Unknown error'));
                    Log::error('Stack trace: ' . (method_exists($e, 'getTraceAsString') ? $e->getTraceAsString() : 'No trace available'));
                }
            } catch (\Throwable $logError) {
                // Logging failed, continue anyway
            }
            
            // Get timestamp safely
            try {
                $timestamp = now()->toISOString();
            } catch (\Throwable $e2) {
                try {
                    $timestamp = date('c');
                } catch (\Throwable $e3) {
                    $timestamp = date('Y-m-d\TH:i:s\Z');
                }
            }
            
            // Return error response
            try {
                $debugMode = config('app.debug', false);
                $errorMessage = $debugMode && method_exists($e, 'getMessage') 
                    ? $e->getMessage() 
                    : 'Health check failed. Please check server logs.';
                
                return response()->json([
                    'status' => 'error',
                    'timestamp' => $timestamp,
                    'message' => $errorMessage,
                    'checks' => []
                ], 500);
            } catch (\Throwable $responseError) {
                // Even response() failed, return plain text
                return response('Health check failed', 500)
                    ->header('Content-Type', 'text/plain');
            }
        }
    }

    /**
     * Detailed system metrics for monitoring
     */
    public function metrics(): JsonResponse
    {
        $metrics = [
            'performance' => $this->getPerformanceMetrics(),
            'database' => $this->getDatabaseMetrics(),
            'cache' => $this->getCacheMetrics(),
            'system' => $this->getSystemMetrics(),
            'application' => $this->getApplicationMetrics()
        ];
        
        return response()->json([
            'timestamp' => now()->toISOString(),
            'metrics' => $metrics
        ]);
    }

    /**
     * Database health check
     */
    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $responseTime = round((microtime(true) - $start) * 1000, 2);
            
            // Check for slow queries - handle cases where query might not return results
            $slowQueries = 0;
            try {
                $result = DB::select("SHOW STATUS LIKE 'Slow_queries'");
                if (!empty($result) && isset($result[0]) && property_exists($result[0], 'Value')) {
                    $slowQueries = (int)$result[0]->Value;
                }
            } catch (\Exception $e) {
                // If SHOW STATUS fails (e.g., not available in all MySQL versions), just continue
                Log::debug('Could not retrieve slow queries status: ' . $e->getMessage());
            }
            
            return [
                'status' => 'ok',
                'message' => 'Database connected',
                'response_time_ms' => $responseTime,
                'slow_queries' => $slowQueries
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'response_time_ms' => null
            ];
        }
    }

    /**
     * Redis health check
     */
    private function checkRedis(): array
    {
        try {
            // Check if Redis facade class exists first
            if (!class_exists('\Illuminate\Support\Facades\Redis')) {
                return [
                    'status' => 'warning',
                    'message' => 'Redis facade not available',
                    'response_time_ms' => null
                ];
            }
            
            // Check if Redis is configured
            try {
                $redisConfig = config('database.redis.default');
                if (empty($redisConfig)) {
                    return [
                        'status' => 'warning',
                        'message' => 'Redis not configured',
                        'response_time_ms' => null
                    ];
                }
            } catch (\Throwable $e) {
                return [
                    'status' => 'warning',
                    'message' => 'Redis configuration not available',
                    'response_time_ms' => null
                ];
            }
            
            // Try to ping Redis with timeout protection
            try {
                $start = microtime(true);
                Redis::connection()->ping();
                $responseTime = round((microtime(true) - $start) * 1000, 2);
                
                // Try to get info, but don't fail if it doesn't work
                try {
                    $info = Redis::connection()->info();
                    return [
                        'status' => 'ok',
                        'message' => 'Redis connected',
                        'response_time_ms' => $responseTime,
                        'memory_used' => $info['used_memory_human'] ?? 'unknown',
                        'connected_clients' => $info['connected_clients'] ?? 0
                    ];
                } catch (\Throwable $e) {
                    // Redis is connected but info() failed
                    return [
                        'status' => 'ok',
                        'message' => 'Redis connected (info unavailable)',
                        'response_time_ms' => $responseTime
                    ];
                }
            } catch (\Throwable $e) {
                // Connection failed
                return [
                    'status' => 'warning',
                    'message' => 'Redis connection failed: ' . (method_exists($e, 'getMessage') ? $e->getMessage() : 'Unknown error'),
                    'response_time_ms' => null
                ];
            }
        } catch (\Throwable $e) {
            // Any other error
            return [
                'status' => 'warning',
                'message' => 'Redis check failed: ' . (method_exists($e, 'getMessage') ? $e->getMessage() : 'Unknown error'),
                'response_time_ms' => null
            ];
        }
    }

    /**
     * Storage health check
     */
    private function checkStorage(): array
    {
        try {
            $storagePath = storage_path();
            $freeSpace = disk_free_space($storagePath);
            $totalSpace = disk_total_space($storagePath);
            
            if ($freeSpace === false || $totalSpace === false) {
                return [
                    'status' => 'warning',
                    'message' => 'Could not determine storage space',
                    'writable' => is_writable($storagePath)
                ];
            }
            
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercentage = round(($usedSpace / $totalSpace) * 100, 2);
            
            // Check if storage is writable (safer method)
            $writable = is_writable($storagePath);
            
            // Try to create a test file if directory is writable
            if ($writable) {
                try {
                    $testFile = $storagePath . '/health_check_' . time() . '.tmp';
                    @file_put_contents($testFile, 'test');
                    if (file_exists($testFile)) {
                        @unlink($testFile);
                    }
                } catch (\Exception $e) {
                    $writable = false;
                }
            }
            
            return [
                'status' => $usagePercentage < 90 && $writable ? 'ok' : 'warning',
                'message' => $writable ? 'Storage accessible' : 'Storage not writable',
                'free_space_gb' => round($freeSpace / (1024 * 1024 * 1024), 2),
                'total_space_gb' => round($totalSpace / (1024 * 1024 * 1024), 2),
                'usage_percentage' => $usagePercentage,
                'writable' => $writable
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'message' => 'Storage check failed: ' . $e->getMessage(),
                'writable' => false
            ];
        }
    }

    /**
     * Queue health check
     */
    private function checkQueue(): array
    {
        try {
            // Check if jobs table exists
            $jobsTableExists = DB::getSchemaBuilder()->hasTable('jobs');
            $failedJobsTableExists = DB::getSchemaBuilder()->hasTable('failed_jobs');
            
            if (!$jobsTableExists && !$failedJobsTableExists) {
                return [
                    'status' => 'warning',
                    'message' => 'Queue tables not found (queue system may not be configured)',
                    'pending_jobs' => 0,
                    'failed_jobs' => 0
                ];
            }
            
            $queueSize = $jobsTableExists ? DB::table('jobs')->count() : 0;
            $failedJobs = $failedJobsTableExists ? DB::table('failed_jobs')->count() : 0;
            
            return [
                'status' => $failedJobs < 100 ? 'ok' : 'warning',
                'message' => 'Queue system operational',
                'pending_jobs' => $queueSize,
                'failed_jobs' => $failedJobs
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'message' => 'Queue check failed: ' . $e->getMessage(),
                'pending_jobs' => 0,
                'failed_jobs' => 0
            ];
        }
    }

    /**
     * Cache health check
     */
    private function checkCache(): array
    {
        try {
            $testKey = 'health_check_' . time();
            Cache::put($testKey, 'test', 60);
            $retrieved = Cache::get($testKey);
            Cache::forget($testKey);
            
            return [
                'status' => $retrieved === 'test' ? 'ok' : 'error',
                'message' => $retrieved === 'test' ? 'Cache operational' : 'Cache not working',
                'driver' => config('cache.default')
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Memory health check
     */
    private function checkMemory(): array
    {
        try {
            $memoryUsage = memory_get_usage(true);
            $peakMemory = memory_get_peak_usage(true);
            $memoryLimit = $this->parseMemoryLimit(ini_get('memory_limit'));
            
            // Prevent division by zero
            if ($memoryLimit <= 0) {
                $memoryLimit = 128 * 1024 * 1024; // Default to 128MB if limit is invalid
            }
            
            $usagePercentage = round(($memoryUsage / $memoryLimit) * 100, 2);
            
            return [
                'status' => $usagePercentage < 80 ? 'ok' : 'warning',
                'message' => 'Memory usage normal',
                'current_usage_mb' => round($memoryUsage / (1024 * 1024), 2),
                'peak_usage_mb' => round($peakMemory / (1024 * 1024), 2),
                'limit_mb' => round($memoryLimit / (1024 * 1024), 2),
                'usage_percentage' => $usagePercentage
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'message' => 'Could not check memory: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Disk space health check
     */
    private function checkDiskSpace(): array
    {
        try {
            $rootPath = base_path();
            $freeSpace = disk_free_space($rootPath);
            $totalSpace = disk_total_space($rootPath);
            
            if ($freeSpace === false || $totalSpace === false) {
                return [
                    'status' => 'warning',
                    'message' => 'Could not determine disk space'
                ];
            }
            
            $usagePercentage = round((($totalSpace - $freeSpace) / $totalSpace) * 100, 2);
            
            return [
                'status' => $usagePercentage < 85 ? 'ok' : 'warning',
                'message' => 'Disk space available',
                'free_space_gb' => round($freeSpace / (1024 * 1024 * 1024), 2),
                'usage_percentage' => $usagePercentage
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'warning',
                'message' => 'Could not check disk space: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get system uptime
     */
    private function getUptime(): string
    {
        try {
            // Check if shell_exec is available
            if (!function_exists('shell_exec') || !is_callable('shell_exec')) {
                return 'Not available (shell_exec disabled)';
            }
            
            // Check if we're on Windows
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                // Windows doesn't have uptime command
                // Try to get boot time, but don't fail if it doesn't work
                try {
                    $bootTime = @shell_exec('systeminfo | findstr /C:"System Boot Time" 2>nul');
                    return $bootTime ? trim($bootTime) : 'Not available on Windows';
                } catch (\Exception $e) {
                    return 'Not available on Windows';
                }
            }
            
            // Try to get uptime on Unix-like systems
            try {
                $uptime = @shell_exec('uptime 2>/dev/null');
                if ($uptime && trim($uptime)) {
                    return trim($uptime);
                }
            } catch (\Exception $e) {
                // Fall through to return 'Unknown'
            }
            
            return 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics(): array
    {
        try {
            $responseTime = defined('LARAVEL_START') 
                ? round((microtime(true) - LARAVEL_START) * 1000, 2) 
                : 0;
            
            $opcacheEnabled = false;
            if (function_exists('opcache_get_status')) {
                try {
                    $opcacheStatus = opcache_get_status(false);
                    $opcacheEnabled = $opcacheStatus && isset($opcacheStatus['opcache_enabled']) && $opcacheStatus['opcache_enabled'];
                } catch (\Exception $e) {
                    // OPCache status check failed, assume disabled
                    $opcacheEnabled = false;
                }
            }
            
            return [
                'response_time_ms' => $responseTime,
                'memory_usage_mb' => round(memory_get_usage(true) / (1024 * 1024), 2),
                'peak_memory_mb' => round(memory_get_peak_usage(true) / (1024 * 1024), 2),
                'opcache_enabled' => $opcacheEnabled
            ];
        } catch (\Exception $e) {
            return [
                'response_time_ms' => 0,
                'memory_usage_mb' => 0,
                'peak_memory_mb' => 0,
                'opcache_enabled' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get database metrics
     */
    private function getDatabaseMetrics(): array
    {
        try {
            $status = DB::select("SHOW STATUS");
            $statusArray = [];
            
            foreach ($status as $stat) {
                if (isset($stat->Variable_name) && isset($stat->Value)) {
                    $statusArray[$stat->Variable_name] = $stat->Value;
                }
            }
            
            return [
                'connections' => $statusArray['Threads_connected'] ?? 0,
                'max_connections' => $statusArray['Max_used_connections'] ?? 0,
                'slow_queries' => $statusArray['Slow_queries'] ?? 0,
                'queries_per_second' => $statusArray['Queries'] ?? 0,
                'uptime_seconds' => $statusArray['Uptime'] ?? 0
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get cache metrics
     */
    private function getCacheMetrics(): array
    {
        try {
            // Check if Redis is configured
            try {
                $redisConfig = config('database.redis.default');
                if (empty($redisConfig)) {
                    return [
                        'status' => 'not_configured',
                        'message' => 'Redis not configured'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'status' => 'not_configured',
                    'message' => 'Redis configuration not available'
                ];
            }
            
            // Check if Redis facade is available
            if (!class_exists('\Illuminate\Support\Facades\Redis')) {
                return [
                    'status' => 'not_available',
                    'message' => 'Redis facade not available'
                ];
            }
            
            try {
                $info = Redis::info();
                
                return [
                    'memory_used' => $info['used_memory_human'] ?? 'unknown',
                    'connected_clients' => $info['connected_clients'] ?? 0,
                    'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                    'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                    'hit_rate' => $this->calculateHitRate($info)
                ];
            } catch (\Exception $e) {
                return [
                    'status' => 'error',
                    'message' => 'Could not retrieve Redis info: ' . $e->getMessage()
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get system metrics
     */
    private function getSystemMetrics(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_time' => now()->toISOString(),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env')
        ];
    }

    /**
     * Get application metrics
     */
    private function getApplicationMetrics(): array
    {
        try {
            return [
                'total_users' => \App\Models\User::count(),
                'total_residents' => \App\Models\Resident::count(),
                'active_sessions' => \App\Models\PersonalAccessToken::where('last_used_at', '>=', now()->subHours(1))->count(),
                'pending_requests' => \App\Models\DocumentRequest::where('status', 'pending')->count()
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Calculate cache hit rate
     */
    private function calculateHitRate($info): float
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;
        
        return $total > 0 ? round(($hits / $total) * 100, 2) : 0;
    }

    /**
     * Parse memory limit string to bytes
     */
    private function parseMemoryLimit($limit): int
    {
        try {
            if (empty($limit) || $limit === '-1') {
                // Unlimited or not set, return a default large value
                return 512 * 1024 * 1024; // 512MB default
            }
            
            $limit = trim($limit);
            if (empty($limit)) {
                return 128 * 1024 * 1024; // 128MB default
            }
            
            $last = strtolower($limit[strlen($limit) - 1]);
            $limit = (int)$limit;
            
            if ($limit <= 0) {
                return 128 * 1024 * 1024; // 128MB default
            }
            
            switch ($last) {
                case 'g':
                    $limit *= 1024;
                case 'm':
                    $limit *= 1024;
                case 'k':
                    $limit *= 1024;
            }
            
            return $limit > 0 ? $limit : 128 * 1024 * 1024; // Ensure positive value
        } catch (\Exception $e) {
            return 128 * 1024 * 1024; // 128MB default on error
        }
    }

    /**
     * Database connection pool status
     */
    public function databasePool(): JsonResponse
    {
        try {
            $connections = [];
            
            // Check primary connection
            $connections['primary'] = $this->testConnection('mysql');
            
            // Check read replica if configured
            if (config('database.connections.mysql_read')) {
                $connections['read_replica'] = $this->testConnection('mysql_read');
            }
            
            return response()->json([
                'status' => 'ok',
                'connections' => $connections,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test database connection
     */
    private function testConnection($connection): array
    {
        try {
            $start = microtime(true);
            DB::connection($connection)->getPdo();
            $responseTime = round((microtime(true) - $start) * 1000, 2);
            
            return [
                'status' => 'ok',
                'response_time_ms' => $responseTime,
                'host' => config("database.connections.{$connection}.host")
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
