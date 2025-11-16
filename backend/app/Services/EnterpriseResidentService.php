<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Resident;
use App\Models\Profile;
use App\Models\User;

class EnterpriseResidentService
{
    /**
     * Get residents with optimized caching and query performance
     */
    public function getResidents($filters = [], $perPage = 50)
    {
        $cacheKey = 'residents:' . md5(serialize($filters)) . ':' . $perPage;
        
        return Cache::remember($cacheKey, 300, function() use ($filters, $perPage) {
            $query = Resident::with(['profile', 'user'])
                ->select([
                    'id', 'residents_id', 'first_name', 'last_name', 
                    'email', 'verification_status', 'profile_completed',
                    'created_at', 'version'
                ]);
            
            // Apply filters using indexes
            if (isset($filters['status'])) {
                $query->where('verification_status', $filters['status']);
            }
            
            if (isset($filters['profile_completed'])) {
                $query->where('profile_completed', $filters['profile_completed']);
            }
            
            if (isset($filters['search'])) {
                $search = $filters['search'];
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%{$search}%")
                      ->orWhere('last_name', 'LIKE', "%{$search}%")
                      ->orWhere('residents_id', 'LIKE', "%{$search}%");
                });
            }
            
            if (isset($filters['years_min'])) {
                $query->where('years_in_barangay', '>=', $filters['years_min']);
            }
            
            return $query->orderBy('created_at', 'desc')->paginate($perPage);
        });
    }

    /**
     * Update resident with optimistic locking and transaction safety
     */
    public function updateResident($residentId, $data, $currentVersion = null)
    {
        return DB::transaction(function() use ($residentId, $data, $currentVersion) {
            $resident = Resident::lockForUpdate()->findOrFail($residentId);
            
            // Optimistic locking check
            if ($currentVersion && $resident->version !== $currentVersion) {
                throw new \Exception('Record was modified by another user. Please refresh and try again.');
            }
            
            // Increment version for optimistic locking
            $data['version'] = $resident->version + 1;
            
            $resident->update($data);
            
            // Clear related cache
            $this->clearResidentCache($residentId);
            
            // Log the update
            $this->logActivity('resident_updated', $residentId, $data);
            
            return $resident->fresh();
        });
    }

    /**
     * Create resident with profile in a single transaction
     */
    public function createResidentWithProfile($userData, $profileData, $residentData)
    {
        return DB::transaction(function() use ($userData, $profileData, $residentData) {
            // Create user
            $user = User::create([
                ...$userData,
                'version' => 1
            ]);
            
            // Create profile
            $profile = Profile::create([
                ...$profileData,
                'user_id' => $user->id,
                'resident_id' => 'R-' . $user->id . '-' . time(),
                'version' => 1
            ]);
            
            // Create resident record
            $resident = Resident::create([
                ...$residentData,
                'user_id' => $user->id,
                'residents_id' => $profile->resident_id,
                'version' => 1
            ]);
            
            // Clear cache
            $this->clearResidentCache();
            
            // Log the creation
            $this->logActivity('resident_created', $resident->id, [
                'user_id' => $user->id,
                'profile_id' => $profile->id
            ]);
            
            return compact('user', 'profile', 'resident');
        });
    }

    /**
     * Get resident statistics with caching
     */
    public function getResidentStatistics()
    {
        return Cache::remember('resident_statistics', 600, function() {
            return [
                'total_residents' => Resident::count(),
                'verified_residents' => Resident::where('verification_status', 'approved')->count(),
                'pending_verification' => Resident::where('verification_status', 'pending')->count(),
                'completed_profiles' => Resident::where('profile_completed', true)->count(),
                'recent_registrations' => Resident::where('created_at', '>=', now()->subDays(30))->count(),
                'by_status' => Resident::select('verification_status', DB::raw('count(*) as count'))
                    ->groupBy('verification_status')
                    ->pluck('count', 'verification_status'),
                'by_years' => Resident::selectRaw('
                    CASE 
                        WHEN years_in_barangay < 1 THEN "Less than 1 year"
                        WHEN years_in_barangay BETWEEN 1 AND 5 THEN "1-5 years"
                        WHEN years_in_barangay BETWEEN 6 AND 10 THEN "6-10 years"
                        WHEN years_in_barangay BETWEEN 11 AND 20 THEN "11-20 years"
                        ELSE "More than 20 years"
                    END as year_range,
                    COUNT(*) as count
                ')
                ->groupBy('year_range')
                ->pluck('count', 'year_range')
            ];
        });
    }

    /**
     * Search residents with full-text search capabilities
     */
    public function searchResidents($searchTerm, $filters = [])
    {
        $cacheKey = 'resident_search:' . md5($searchTerm . serialize($filters));
        
        return Cache::remember($cacheKey, 180, function() use ($searchTerm, $filters) {
            $query = Resident::with(['profile', 'user'])
                ->select([
                    'id', 'residents_id', 'first_name', 'last_name', 
                    'email', 'verification_status', 'full_address'
                ]);
            
            // Full-text search using indexes
            $query->where(function($q) use ($searchTerm) {
                $q->where('first_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('last_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('residents_id', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('full_address', 'LIKE', "%{$searchTerm}%");
            });
            
            // Apply additional filters
            if (isset($filters['status'])) {
                $query->where('verification_status', $filters['status']);
            }
            
            if (isset($filters['profile_completed'])) {
                $query->where('profile_completed', $filters['profile_completed']);
            }
            
            return $query->orderBy('created_at', 'desc')->limit(100)->get();
        });
    }

    /**
     * Bulk update residents with batch processing
     */
    public function bulkUpdateResidents($updates)
    {
        return DB::transaction(function() use ($updates) {
            $results = [];
            
            foreach ($updates as $update) {
                try {
                    $resident = Resident::lockForUpdate()->findOrFail($update['id']);
                    
                    // Check version for optimistic locking
                    if (isset($update['version']) && $resident->version !== $update['version']) {
                        $results[] = [
                            'id' => $update['id'],
                            'status' => 'failed',
                            'error' => 'Version mismatch'
                        ];
                        continue;
                    }
                    
                    $updateData = $update['data'];
                    $updateData['version'] = $resident->version + 1;
                    
                    $resident->update($updateData);
                    
                    $results[] = [
                        'id' => $update['id'],
                        'status' => 'success',
                        'version' => $resident->version
                    ];
                    
                } catch (\Exception $e) {
                    $results[] = [
                        'id' => $update['id'],
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }
            
            // Clear cache after bulk update
            $this->clearResidentCache();
            
            // Log bulk operation
            $this->logActivity('resident_bulk_update', null, [
                'total_updates' => count($updates),
                'successful' => collect($results)->where('status', 'success')->count(),
                'failed' => collect($results)->where('status', 'failed')->count()
            ]);
            
            return $results;
        });
    }

    /**
     * Get resident with all related data efficiently
     */
    public function getResidentWithRelations($residentId)
    {
        $cacheKey = "resident_full:{$residentId}";
        
        return Cache::remember($cacheKey, 300, function() use ($residentId) {
            return Resident::with([
                'profile',
                'user',
                'assetRequests' => function($query) {
                    $query->select(['id', 'resident_id', 'status', 'created_at'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                },
                'documentRequests' => function($query) {
                    $query->select(['id', 'resident_id', 'status', 'document_type', 'created_at'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                },
                'beneficiaries' => function($query) {
                    $query->with('program')
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                }
            ])->findOrFail($residentId);
        });
    }

    /**
     * Clear resident-related cache
     */
    private function clearResidentCache($residentId = null)
    {
        // Clear general cache patterns
        Cache::forget('resident_statistics');
        
        if ($residentId) {
            Cache::forget("resident_full:{$residentId}");
        }
        
        // Clear search cache patterns
        $keys = Cache::getRedis()->keys('*resident*');
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Log activity with performance tracking
     */
    private function logActivity($action, $modelId, $data = [])
    {
        try {
            \App\Models\ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'model_type' => 'Resident',
                'model_id' => $modelId,
                'changes' => $data,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log activity', [
                'action' => $action,
                'model_id' => $modelId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get performance metrics for monitoring
     */
    public function getPerformanceMetrics()
    {
        return [
            'cache_hit_rate' => $this->getCacheHitRate(),
            'average_query_time' => $this->getAverageQueryTime(),
            'active_connections' => $this->getActiveConnections(),
            'memory_usage' => memory_get_peak_usage(true),
            'database_size' => $this->getDatabaseSize()
        ];
    }

    private function getCacheHitRate()
    {
        // This would integrate with Redis INFO command
        return Cache::getRedis()->info()['keyspace_hits'] ?? 0;
    }

    private function getAverageQueryTime()
    {
        // This would integrate with query logging
        return 0; // Placeholder
    }

    private function getActiveConnections()
    {
        return DB::select('SHOW STATUS LIKE "Threads_connected"')[0]->Value ?? 0;
    }

    private function getDatabaseSize()
    {
        $result = DB::select("
            SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        ");
        
        return $result[0]->{'DB Size in MB'} ?? 0;
    }
}
