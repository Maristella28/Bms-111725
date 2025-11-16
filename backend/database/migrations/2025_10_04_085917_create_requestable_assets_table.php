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
        Schema::create('requestable_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('condition')->default('good'); // excellent, good, fair, poor
            $table->string('status')->default('available'); // available, rented, maintenance, unavailable
            $table->decimal('price', 10, 2)->default(0.00);
            $table->integer('stock')->default(1);
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->string('image')->nullable();
            $table->json('available_dates')->nullable(); // Array of available dates
            $table->decimal('rating', 3, 2)->default(5.00); // 0.00 to 5.00
            $table->integer('reviews_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable(); // Admin who created this asset
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['status', 'is_active']);
            $table->index(['category', 'is_active']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requestable_assets');
    }
};
