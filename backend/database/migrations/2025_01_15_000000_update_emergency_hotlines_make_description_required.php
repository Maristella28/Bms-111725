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
        // Check if the table exists before modifying
        if (Schema::hasTable('emergency_hotlines')) {
            Schema::table('emergency_hotlines', function (Blueprint $table) {
                // Make description required (not nullable)
                $table->string('description')->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('emergency_hotlines')) {
            Schema::table('emergency_hotlines', function (Blueprint $table) {
                // Revert description back to nullable
                $table->string('description')->nullable()->change();
            });
        }
    }
};

