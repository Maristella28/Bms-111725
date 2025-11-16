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
            // Add complainant contact fields
            $table->string('complainant_contact_number')->nullable()->after('complainant_name');
            $table->string('complainant_email')->nullable()->after('complainant_contact_number');
            
            // Add respondent contact fields
            $table->string('respondent_contact_number')->nullable()->after('respondent_name');
            $table->string('respondent_email')->nullable()->after('respondent_contact_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->dropColumn([
                'complainant_contact_number',
                'complainant_email',
                'respondent_contact_number',
                'respondent_email'
            ]);
        });
    }
};
