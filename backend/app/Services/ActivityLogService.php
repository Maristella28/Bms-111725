<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log an activity
     */
    public static function log(
        string $action,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?Request $request = null
    ): ActivityLog {
        $userId = Auth::id();

        if (!$userId && $model instanceof User) {
            $userId = $model->getKey();
        }
        $ipAddress = $request ? $request->ip() : request()->ip();
        $userAgent = $request ? $request->userAgent() : request()->userAgent();

        $modelType = $model ? get_class($model) : null;
        $modelId = $model ? $model->getKey() : null;

        // Generate description if not provided
        if (!$description) {
            $description = self::generateDescription($action, $model, $userId);
        }

        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => $description,
        ]);
    }

    /**
     * Log user authentication activities
     */
    public static function logAuth(string $action, ?Request $request = null, ?User $actingUser = null): ActivityLog
    {
        $user = $actingUser ?? Auth::user();
        $userName = $user && isset($user->name) ? $user->name : 'Unknown';
        $userEmail = $user && isset($user->email) ? $user->email : '';

        $description = match($action) {
            'login' => "User {$userName} ({$userEmail}) logged in",
            'logout' => "User {$userName} ({$userEmail}) logged out",
            'register' => "User {$userName} ({$userEmail}) registered",
            'verify_email' => "User {$userName} ({$userEmail}) verified email",
            default => "User authentication: {$action}"
        };

        return self::log($action, $user ?? null, null, null, $description, $request);
    }

    /**
     * Log model creation
     */
    public static function logCreated(Model $model, ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('created', $model, Auth::id());
        return self::log('created', $model, null, $model->toArray(), $description, $request);
    }

    /**
     * Log model update
     */
    public static function logUpdated(Model $model, array $oldValues = [], ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('updated', $model, Auth::id());
        return self::log('updated', $model, $oldValues, $model->toArray(), $description, $request);
    }

    /**
     * Log model deletion
     */
    public static function logDeleted(Model $model, ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('deleted', $model, Auth::id());
        return self::log('deleted', $model, $model->toArray(), null, $description, $request);
    }

    /**
     * Log admin actions
     */
    public static function logAdminAction(string $action, ?string $description = null, ?Request $request = null): ActivityLog
    {
        $user = Auth::user();
        $userName = $user && isset($user->name) ? $user->name : 'Unknown Admin';
        if (!$description) {
            $description = "Admin {$userName} performed action: {$action}";
        }

        return self::log("admin.{$action}", null, null, null, $description, $request);
    }

    /**
     * Generate a human-readable description for the activity
     */
    private static function generateDescription(string $action, ?Model $model, ?int $userId): string
    {
        $user = $userId ? \App\Models\User::find($userId) : null;
        $userName = $user ? $user->name : 'System';

        if (!$model) {
            return "{$userName} performed action: {$action}";
        }

        $modelName = class_basename($model);
        $modelId = $model->getKey();

        return match($action) {
            'created' => "{$userName} created {$modelName} #{$modelId}",
            'updated' => "{$userName} updated {$modelName} #{$modelId}",
            'deleted' => "{$userName} deleted {$modelName} #{$modelId}",
            'viewed' => "{$userName} viewed {$modelName} #{$modelId}",
            default => "{$userName} performed {$action} on {$modelName} #{$modelId}"
        };
    }

    /**
     * Get activity logs with filtering
     */
    public static function getLogs(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');

        self::applyCommonFilters($query, $filters);
        self::applyUserTypeFilter($query, $filters['user_type'] ?? null);

        $perPage = isset($filters['per_page']) && $filters['per_page'] ? (int)$filters['per_page'] : 20;
        $page = isset($filters['page']) && $filters['page'] ? (int)$filters['page'] : 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get role-based counts for the current filter set (excluding user type filter)
     */
    public static function getCounts(array $filters = []): array
    {
        $countFilters = $filters;
        unset($countFilters['user_type'], $countFilters['page'], $countFilters['per_page']);

        $baseQuery = ActivityLog::query();
        self::applyCommonFilters($baseQuery, $countFilters);

        $counts = [
            'total' => (clone $baseQuery)->count(),
            'admin' => self::countByRole(clone $baseQuery, 'admin'),
            'resident' => self::countByRole(clone $baseQuery, 'resident'),
            'staff' => self::countByRole(clone $baseQuery, 'staff'),
            'system' => (clone $baseQuery)->whereNull('user_id')->count(),
        ];

        return $counts;
    }

    /**
     * Normalize role filters to support pluralization and alternate labels
     */
    private static function getRoleAliases(string $role): array
    {
        $normalized = strtolower(trim($role));

        return match($normalized) {
            'admin', 'admins', 'administrator', 'administrators' => ['admin', 'administrator', 'administrators', 'admins'],
            'resident', 'residents' => ['resident', 'residents'],
            'staff', 'staffs' => ['staff', 'staffs'],
            default => [$normalized],
        };
    }

    /**
     * Apply filters common to both log retrieval and aggregate counts
     */
    private static function applyCommonFilters($query, array $filters = []): void
    {
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['model_type'])) {
            $query->where('model_type', $filters['model_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
    }

    /**
     * Apply user-type specific filter to the query
     */
    private static function applyUserTypeFilter($query, ?string $userType): void
    {
        if (!$userType || strtolower($userType) === 'all') {
            return;
        }

        $aliases = self::getRoleAliases($userType);

        $query->whereHas('user', function($q) use ($aliases) {
            $q->where(function($roleQuery) use ($aliases) {
                foreach ($aliases as $alias) {
                    $roleQuery->orWhereRaw('LOWER(role) = ?', [$alias]);
                }
            });
        });
    }

    /**
     * Count activities for a specific role
     */
    private static function countByRole($query, string $role): int
    {
        $aliases = self::getRoleAliases($role);

        $query->whereHas('user', function($q) use ($aliases) {
            $q->where(function($roleQuery) use ($aliases) {
                foreach ($aliases as $alias) {
                    $roleQuery->orWhereRaw('LOWER(role) = ?', [$alias]);
                }
            });
        });

        return $query->count();
    }
}
