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
        Schema::table('asset_request_items', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('returned_at');
            $table->datetime('tracking_generated_at')->nullable()->after('tracking_number');
            $table->string('tracking_generated_by')->nullable()->after('tracking_generated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_request_items', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'tracking_generated_at', 'tracking_generated_by']);
        });
    }
};