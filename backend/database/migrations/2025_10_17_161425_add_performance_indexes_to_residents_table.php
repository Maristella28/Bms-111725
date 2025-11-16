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
        Schema::table('residents', function (Blueprint $table) {
            // Add indexes for performance optimization
            $table->index(['user_id'], 'idx_residents_user_id');
            $table->index(['first_name', 'last_name'], 'idx_residents_name_search');
            $table->index(['email'], 'idx_residents_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            // Drop the indexes
            $table->dropIndex('idx_residents_user_id');
            $table->dropIndex('idx_residents_name_search');
            $table->dropIndex('idx_residents_email');
        });
    }
};
