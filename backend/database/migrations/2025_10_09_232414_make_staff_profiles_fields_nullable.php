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
        // Use raw SQL to modify columns since Doctrine DBAL has issues with some Laravel types
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN birth_date DATE NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN age TINYINT UNSIGNED NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN sex VARCHAR(255) NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN civil_status VARCHAR(255) NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN department VARCHAR(255) NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN position VARCHAR(255) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to NOT NULL (this might fail if there are NULL values)
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN birth_date DATE NOT NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN age TINYINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN sex VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN civil_status VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN department VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE staff_profiles MODIFY COLUMN position VARCHAR(255) NOT NULL');
    }
};