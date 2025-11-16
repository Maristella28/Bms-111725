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
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();
            $table->foreignId('staff_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_suffix')->nullable();
            $table->date('birth_date');
            $table->string('birth_place')->nullable();
            $table->unsignedTinyInteger('age');
            $table->string('nationality')->nullable();
            $table->string('sex');
            $table->string('civil_status');
            $table->string('religion')->nullable();
            $table->string('email');
            $table->string('mobile_number')->nullable();
            $table->string('landline_number')->nullable();
            $table->text('current_address')->nullable();
            $table->string('current_photo')->nullable();
            $table->string('department');
            $table->string('position');
            $table->string('employee_id')->nullable();
            $table->date('hire_date')->nullable();
            $table->string('employment_status')->default('active');
            $table->string('educational_attainment')->nullable();
            $table->text('work_experience')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_number')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->text('skills')->nullable();
            $table->text('certifications')->nullable();
            $table->string('profile_completed')->default('false');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
