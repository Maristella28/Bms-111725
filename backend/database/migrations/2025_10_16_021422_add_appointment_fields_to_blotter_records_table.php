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
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->date('appointment_date')->nullable()->after('solved_at');
            $table->time('appointment_time')->nullable()->after('appointment_date');
            $table->timestamp('notification_sent_at')->nullable()->after('appointment_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->dropColumn(['appointment_date', 'appointment_time', 'notification_sent_at']);
        });
    }
};
