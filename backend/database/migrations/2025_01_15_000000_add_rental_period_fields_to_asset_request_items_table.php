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
            $table->integer('rental_duration_days')->default(1)->after('end_time');
            $table->datetime('return_date')->nullable()->after('rental_duration_days');
            $table->boolean('is_returned')->default(false)->after('return_date');
            $table->datetime('returned_at')->nullable()->after('is_returned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_request_items', function (Blueprint $table) {
            $table->dropColumn(['rental_duration_days', 'return_date', 'is_returned', 'returned_at']);
        });
    }
};
