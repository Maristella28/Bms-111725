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
        Schema::create('paid_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_request_id')->constrained('document_requests')->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_method')->nullable(); // cash, check, online, etc.
            $table->text('payment_reference')->nullable(); // check number, transaction ID, etc.
            $table->timestamp('payment_date');
            $table->string('received_by')->nullable(); // staff member who received payment
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('receipt_number');
            $table->index('payment_date');
            $table->index('document_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paid_documents');
    }
};
