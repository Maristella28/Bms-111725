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
        Schema::table('document_requests', function (Blueprint $table) {
            // Add indexes for performance optimization
            $table->index(['user_id'], 'idx_document_requests_user_id');
            $table->index(['status'], 'idx_document_requests_status');
            $table->index(['created_at'], 'idx_document_requests_created_at');
            $table->index(['status', 'created_at'], 'idx_document_requests_status_created');
            $table->index(['document_type'], 'idx_document_requests_document_type');
            $table->index(['payment_status'], 'idx_document_requests_payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            // Drop the indexes
            $table->dropIndex('idx_document_requests_user_id');
            $table->dropIndex('idx_document_requests_status');
            $table->dropIndex('idx_document_requests_created_at');
            $table->dropIndex('idx_document_requests_status_created');
            $table->dropIndex('idx_document_requests_document_type');
            $table->dropIndex('idx_document_requests_payment_status');
        });
    }
};
