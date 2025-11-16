<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE blotter_records MODIFY COLUMN status ENUM('Ongoing', 'Pending', 'Scheduled', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Ongoing'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE blotter_records MODIFY COLUMN status ENUM('Pending', 'Scheduled', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Pending'");
    }
};
