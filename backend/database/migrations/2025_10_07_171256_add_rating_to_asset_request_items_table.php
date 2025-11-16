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
            $table->integer('rating')->nullable()->after('tracking_generated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_request_items', function (Blueprint $table) {
            $table->dropColumn('rating');
        });
    }
};