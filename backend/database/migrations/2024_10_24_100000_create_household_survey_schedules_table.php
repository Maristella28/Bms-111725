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
        Schema::create('household_survey_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('survey_type'); // comprehensive, relocation, deceased, contact, quick
            $table->string('notification_method'); // email, sms, both
            $table->string('frequency'); // daily, weekly, monthly, quarterly, annually
            $table->string('target_households')->default('all'); // all, specific
            $table->json('specific_household_ids')->nullable();
            $table->text('custom_message')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('start_date');
            $table->time('scheduled_time');
            $table->integer('day_of_week')->nullable(); // 0-6 (Sunday-Saturday)
            $table->integer('day_of_month')->nullable(); // 1-28
            $table->timestamp('last_run_date')->nullable();
            $table->timestamp('next_run_date')->nullable();
            $table->integer('total_runs')->default(0);
            $table->integer('surveys_sent')->default(0);
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['is_active', 'next_run_date']);
            $table->index('created_by_user_id');
        });

        // Add schedule_id to household_surveys table (if it exists)
        if (Schema::hasTable('household_surveys')) {
            Schema::table('household_surveys', function (Blueprint $table) {
                $table->foreignId('schedule_id')->nullable()->after('household_id')->constrained('household_survey_schedules')->onDelete('set null');
                $table->index('schedule_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('household_surveys', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
            $table->dropColumn('schedule_id');
        });

        Schema::dropIfExists('household_survey_schedules');
    }
};

