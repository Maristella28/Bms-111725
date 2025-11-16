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
            // No-show tracking fields
            $table->boolean('complainant_no_show')->default(false);
            $table->boolean('respondent_no_show')->default(false);
            $table->timestamp('complainant_no_show_at')->nullable();
            $table->timestamp('respondent_no_show_at')->nullable();
            $table->text('complainant_no_show_reason')->nullable();
            $table->text('respondent_no_show_reason')->nullable();
            $table->boolean('complainant_appeal_submitted')->default(false);
            $table->boolean('respondent_appeal_submitted')->default(false);
            $table->text('complainant_appeal_reason')->nullable();
            $table->text('respondent_appeal_reason')->nullable();
            $table->enum('complainant_appeal_status', ['pending', 'approved', 'rejected'])->nullable();
            $table->enum('respondent_appeal_status', ['pending', 'approved', 'rejected'])->nullable();
            $table->timestamp('complainant_appeal_reviewed_at')->nullable();
            $table->timestamp('respondent_appeal_reviewed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->dropColumn([
                'complainant_no_show',
                'respondent_no_show',
                'complainant_no_show_at',
                'respondent_no_show_at',
                'complainant_no_show_reason',
                'respondent_no_show_reason',
                'complainant_appeal_submitted',
                'respondent_appeal_submitted',
                'complainant_appeal_reason',
                'respondent_appeal_reason',
                'complainant_appeal_status',
                'respondent_appeal_status',
                'complainant_appeal_reviewed_at',
                'respondent_appeal_reviewed_at'
            ]);
        });
    }
};
