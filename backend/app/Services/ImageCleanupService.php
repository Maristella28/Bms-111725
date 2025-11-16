<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageCleanupService
{
    /**
     * Clean up old images when updating records
     */
    public static function cleanupOldImage($oldPath, $newPath = null)
    {
        // Only delete if we have an old path and it's different from new path
        if ($oldPath && $oldPath !== $newPath) {
            try {
                // Remove /storage/ prefix if present for storage path
                $storagePath = str_replace('/storage/', '', $oldPath);
                
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                    Log::info('Cleaned up old image', ['path' => $oldPath]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to cleanup old image', [
                    'path' => $oldPath,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
    
    /**
     * Clean up multiple old images
     */
    public static function cleanupOldImages($oldPaths, $newPaths = [])
    {
        if (is_string($oldPaths)) {
            $oldPaths = json_decode($oldPaths, true) ?? [];
        }
        
        foreach ($oldPaths as $oldPath) {
            // Only delete if not in new paths
            if (!in_array($oldPath, $newPaths)) {
                self::cleanupOldImage($oldPath);
            }
        }
    }
}
