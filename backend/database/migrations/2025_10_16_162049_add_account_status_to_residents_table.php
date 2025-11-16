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
            // Account status and penalty tracking
            $table->enum('account_status', ['active', 'warning', 'restricted', 'suspended', 'permanently_restricted'])->default('active')->after('for_review');
            $table->integer('no_show_count')->default(0)->after('account_status');
            $table->timestamp('last_no_show_at')->nullable()->after('no_show_count');
            $table->timestamp('penalty_started_at')->nullable()->after('last_no_show_at');
            $table->timestamp('penalty_ends_at')->nullable()->after('penalty_started_at');
            $table->text('penalty_reason')->nullable()->after('penalty_ends_at');
            $table->boolean('can_submit_complaints')->default(true)->after('penalty_reason');
            $table->boolean('can_submit_applications')->default(true)->after('can_submit_complaints');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropColumn([
                'account_status',
                'no_show_count',
                'last_no_show_at',
                'penalty_started_at',
                'penalty_ends_at',
                'penalty_reason',
                'can_submit_complaints',
                'can_submit_applications'
            ]);
        });
    }
};
