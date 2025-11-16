<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if foreign key constraint exists and drop it
        $foreignKeys = \DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'asset_request_items' 
            AND COLUMN_NAME = 'asset_id' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        
        foreach ($foreignKeys as $fk) {
            \DB::statement("ALTER TABLE asset_request_items DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
        }
        
        // Add new foreign key constraint to requestable_assets table
        Schema::table('asset_request_items', function (Blueprint $table) {
            $table->foreign('asset_id')->references('id')->on('requestable_assets')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_request_items', function (Blueprint $table) {
            // Drop the requestable_assets foreign key constraint
            $table->dropForeign(['asset_id']);
            
            // Restore the original foreign key constraint to assets table
            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
        });
    }
};