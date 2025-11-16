<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('household_surveys', function (Blueprint $table) {
            $table->foreignId('schedule_id')->nullable()->after('household_id')->constrained('household_survey_schedules')->onDelete('set null');
            $table->index('schedule_id');
        });
    }

    public function down(): void
    {
        Schema::table('household_surveys', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
            $table->dropColumn('schedule_id');
        });
    }
};
