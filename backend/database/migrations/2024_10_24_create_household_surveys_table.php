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
        Schema::create('household_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->onDelete('cascade');
            $table->string('survey_type'); // comprehensive, relocation, deceased, contact, quick
            $table->string('survey_token')->unique();
            $table->string('notification_method'); // email, sms, print
            $table->json('questions');
            $table->json('responses')->nullable();
            $table->json('additional_info')->nullable();
            $table->text('custom_message')->nullable();
            $table->string('status')->default('pending'); // pending, sent, opened, completed, expired
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('sent_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['household_id', 'status']);
            $table->index(['survey_token']);
            $table->index(['status', 'expires_at']);
        });

        Schema::create('household_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->onDelete('cascade');
            $table->string('change_type'); // relocation, deceased, new_member, address_change, contact_update
            $table->text('description');
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->timestamp('change_date');
            $table->string('reported_by'); // survey, admin, system
            $table->string('status')->default('pending_review'); // pending_review, approved, rejected
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();

            $table->index(['household_id', 'status']);
            $table->index(['status', 'change_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_change_logs');
        Schema::dropIfExists('household_surveys');
    }
};

