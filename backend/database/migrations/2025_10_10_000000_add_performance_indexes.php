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
        // Add performance indexes to residents table
        Schema::table('residents', function (Blueprint $table) {
            // Search optimization indexes
            $table->index(['first_name', 'last_name'], 'idx_residents_name_search');
            // $table->index(['residents_id'], 'idx_residents_id'); // Column doesn't exist
            $table->index(['email'], 'idx_residents_email');
            
            // Status filtering indexes
            $table->index(['verification_status'], 'idx_residents_verification_status');
            $table->index(['profile_completed'], 'idx_residents_profile_completed');
            
            // Location-based queries
            $table->index(['full_address'], 'idx_residents_address');
            $table->index(['years_in_barangay'], 'idx_residents_years');
            
            // Composite indexes for common queries
            $table->index(['verification_status', 'profile_completed'], 'idx_residents_status_complete');
            $table->index(['created_at', 'verification_status'], 'idx_residents_recent_status');
            
            // User relationship optimization
            $table->index(['user_id'], 'idx_residents_user_id');
            
            // Optimistic locking - only add if column doesn't exist
            if (!Schema::hasColumn('residents', 'version')) {
                $table->integer('version')->default(1)->after('id');
            }
        });

        // Add performance indexes to profiles table
        Schema::table('profiles', function (Blueprint $table) {
            $table->index(['user_id'], 'idx_profiles_user_id');
            $table->index(['resident_id'], 'idx_profiles_resident_id');
            $table->index(['verification_status'], 'idx_profiles_verification_status');
            $table->index(['profile_completed'], 'idx_profiles_completed');
            $table->index(['first_name', 'last_name'], 'idx_profiles_name_search');
            $table->index(['email'], 'idx_profiles_email');
            
            // Optimistic locking - only add if column doesn't exist
            if (!Schema::hasColumn('profiles', 'version')) {
                $table->integer('version')->default(1)->after('id');
            }
        });

        // Add performance indexes to users table
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role'], 'idx_users_role');
            $table->index(['email_verified_at'], 'idx_users_email_verified');
            $table->index(['created_at'], 'idx_users_created_at');
            $table->index(['last_activity_at'], 'idx_users_last_activity');
            
            // Optimistic locking - only add if column doesn't exist
            if (!Schema::hasColumn('users', 'version')) {
                $table->integer('version')->default(1)->after('id');
            }
        });

        // Add performance indexes to asset_requests table
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->index(['status'], 'idx_asset_requests_status');
            $table->index(['user_id'], 'idx_asset_requests_user_id');
            $table->index(['created_at'], 'idx_asset_requests_created_at');
            $table->index(['status', 'created_at'], 'idx_asset_requests_status_created');
        });

        // Add performance indexes to document_requests table
        Schema::table('document_requests', function (Blueprint $table) {
            $table->index(['status'], 'idx_document_requests_status');
            $table->index(['user_id'], 'idx_document_requests_user_id');
            $table->index(['document_type'], 'idx_document_requests_type');
            $table->index(['created_at'], 'idx_document_requests_created_at');
            $table->index(['status', 'created_at'], 'idx_document_requests_status_created');
        });

        // Add performance indexes to activity_logs table
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id'], 'idx_activity_logs_user_id');
            $table->index(['model_type', 'model_id'], 'idx_activity_logs_model');
            $table->index(['action'], 'idx_activity_logs_action');
            $table->index(['created_at'], 'idx_activity_logs_created_at');
            $table->index(['user_id', 'created_at'], 'idx_activity_logs_user_created');
        });

        // Add performance indexes to beneficiaries table
        Schema::table('beneficiaries', function (Blueprint $table) {
            $table->index(['resident_id'], 'idx_beneficiaries_resident_id');
            $table->index(['program_id'], 'idx_beneficiaries_program_id');
            $table->index(['status'], 'idx_beneficiaries_status');
            $table->index(['paid'], 'idx_beneficiaries_paid');
            $table->index(['created_at'], 'idx_beneficiaries_created_at');
        });

        // Add performance indexes to programs table
        Schema::table('programs', function (Blueprint $table) {
            $table->index(['status'], 'idx_programs_status');
            $table->index(['created_at'], 'idx_programs_created_at');
            $table->index(['status', 'created_at'], 'idx_programs_status_created');
        });

        // Add performance indexes to staff table
        Schema::table('staff', function (Blueprint $table) {
            $table->index(['user_id'], 'idx_staff_user_id');
            $table->index(['status'], 'idx_staff_status');
            $table->index(['created_at'], 'idx_staff_created_at');
        });

        // Add performance indexes to announcements table
        Schema::table('announcements', function (Blueprint $table) {
            $table->index(['status'], 'idx_announcements_status');
            $table->index(['created_at'], 'idx_announcements_created_at');
            $table->index(['status', 'created_at'], 'idx_announcements_status_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex('idx_residents_name_search');
            // $table->dropIndex('idx_residents_id'); // Column doesn't exist
            $table->dropIndex('idx_residents_email');
            $table->dropIndex('idx_residents_verification_status');
            $table->dropIndex('idx_residents_profile_completed');
            $table->dropIndex('idx_residents_address');
            $table->dropIndex('idx_residents_years');
            $table->dropIndex('idx_residents_status_complete');
            $table->dropIndex('idx_residents_recent_status');
            $table->dropIndex('idx_residents_user_id');
            $table->dropColumn('version');
        });

        Schema::table('profiles', function (Blueprint $table) {
            $table->dropIndex('idx_profiles_user_id');
            $table->dropIndex('idx_profiles_resident_id');
            $table->dropIndex('idx_profiles_verification_status');
            $table->dropIndex('idx_profiles_completed');
            $table->dropIndex('idx_profiles_name_search');
            $table->dropIndex('idx_profiles_email');
            $table->dropColumn('version');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_email_verified');
            $table->dropIndex('idx_users_created_at');
            $table->dropIndex('idx_users_last_activity');
            $table->dropColumn('version');
        });

        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropIndex('idx_asset_requests_status');
            $table->dropIndex('idx_asset_requests_user_id');
            $table->dropIndex('idx_asset_requests_created_at');
            $table->dropIndex('idx_asset_requests_status_created');
        });

        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropIndex('idx_document_requests_status');
            $table->dropIndex('idx_document_requests_user_id');
            $table->dropIndex('idx_document_requests_type');
            $table->dropIndex('idx_document_requests_created_at');
            $table->dropIndex('idx_document_requests_status_created');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('idx_activity_logs_user_id');
            $table->dropIndex('idx_activity_logs_model');
            $table->dropIndex('idx_activity_logs_action');
            $table->dropIndex('idx_activity_logs_created_at');
            $table->dropIndex('idx_activity_logs_user_created');
        });

        Schema::table('beneficiaries', function (Blueprint $table) {
            $table->dropIndex('idx_beneficiaries_resident_id');
            $table->dropIndex('idx_beneficiaries_program_id');
            $table->dropIndex('idx_beneficiaries_status');
            $table->dropIndex('idx_beneficiaries_paid');
            $table->dropIndex('idx_beneficiaries_created_at');
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex('idx_programs_status');
            $table->dropIndex('idx_programs_created_at');
            $table->dropIndex('idx_programs_status_created');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropIndex('idx_staff_user_id');
            $table->dropIndex('idx_staff_status');
            $table->dropIndex('idx_staff_created_at');
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex('idx_announcements_status');
            $table->dropIndex('idx_announcements_created_at');
            $table->dropIndex('idx_announcements_status_created');
        });
    }
};
