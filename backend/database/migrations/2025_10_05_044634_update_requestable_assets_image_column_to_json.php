<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's check if there's any existing data and convert it
        $existingAssets = DB::table('requestable_assets')->whereNotNull('image')->get();
        
        // Convert existing string images to JSON format
        foreach ($existingAssets as $asset) {
            if ($asset->image && !is_null($asset->image)) {
                // If it's already JSON, skip
                if (is_string($asset->image) && (str_starts_with($asset->image, '[') || str_starts_with($asset->image, '{'))) {
                    continue;
                }
                
                // Convert single image string to array format
                $imageArray = [$asset->image];
                DB::table('requestable_assets')
                    ->where('id', $asset->id)
                    ->update(['image' => json_encode($imageArray)]);
            }
        }
        
        // Now change the column type from string to json
        Schema::table('requestable_assets', function (Blueprint $table) {
            $table->json('image')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert JSON images back to string format (take first image only)
        $existingAssets = DB::table('requestable_assets')->whereNotNull('image')->get();
        
        foreach ($existingAssets as $asset) {
            if ($asset->image && !is_null($asset->image)) {
                $decoded = json_decode($asset->image, true);
                if (is_array($decoded) && !empty($decoded)) {
                    // Take the first image
                    $firstImage = $decoded[0];
                    DB::table('requestable_assets')
                        ->where('id', $asset->id)
                        ->update(['image' => $firstImage]);
                }
            }
        }
        
        // Change column back to string
        Schema::table('requestable_assets', function (Blueprint $table) {
            $table->string('image')->nullable()->change();
        });
    }
};