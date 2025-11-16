<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProgramAndBeneficiarySeeder extends Seeder
{
    public function run(): void
    {
        // Insert sample programs
        $programs = [
            [
                'name' => '4Ps',
                'description' => 'Pantawid Pamilyang Pilipino Program - Provides one-time financial aid to college students and families in need',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'beneficiary_type' => 'families',
                'assistance_type' => 'financial',
                'amount' => 500000.00,
                'status' => 'active',
                'max_beneficiaries' => 100,
                'payout_date' => '2024-06-15 10:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Senior Citizen Pension',
                'description' => 'Monthly pension for senior citizens - The Medical Assistance Program provides financial support for medical expenses',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'beneficiary_type' => 'seniors',
                'assistance_type' => 'medical',
                'amount' => 300000.00,
                'status' => 'active',
                'max_beneficiaries' => 50,
                'payout_date' => '2024-07-01 09:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Educational Assistance',
                'description' => 'Educational support program for students - Provides scholarships and educational materials',
                'start_date' => '2024-02-01',
                'end_date' => '2024-11-30',
                'beneficiary_type' => 'students',
                'assistance_type' => 'educational',
                'amount' => 200000.00,
                'status' => 'ongoing',
                'max_beneficiaries' => 75,
                'payout_date' => '2024-08-15 14:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('programs')->insert($programs);

        // Get inserted program IDs
        $programIds = DB::table('programs')->pluck('id')->toArray();

        // Insert sample beneficiaries
        $beneficiaries = [
            [
                'name' => 'Maria Santos',
                'beneficiary_type' => 'Senior Citizen',
                'status' => 'Approved',
                'application_date' => '2024-01-15',
                'approved_date' => '2024-01-20',
                'contact_number' => '+63 912 345 6789',
                'email' => 'maria.santos@email.com',
                'address' => '123 Barangay Street, City',
                'assistance_type' => 'Monthly Pension',
                'amount' => 5000,
                'remarks' => 'All requirements submitted and verified',
                'program_id' => $programIds[1] ?? 1,
                'is_paid' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Juan Dela Cruz',
                'beneficiary_type' => '4Ps',
                'status' => 'Pending',
                'application_date' => '2024-02-10',
                'approved_date' => null,
                'contact_number' => '+63 933 222 1111',
                'email' => 'juan.delacruz@email.com',
                'address' => '456 Barangay Avenue, City',
                'assistance_type' => 'Cash Grant',
                'amount' => 2000,
                'remarks' => 'Waiting for document verification',
                'program_id' => $programIds[0] ?? 1,
                'is_paid' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ana Rodriguez',
                'beneficiary_type' => 'Student',
                'status' => 'Approved',
                'application_date' => '2024-03-01',
                'approved_date' => '2024-03-05',
                'contact_number' => '+63 944 555 6666',
                'email' => 'ana.rodriguez@email.com',
                'address' => '789 University Road, City',
                'assistance_type' => 'Educational Grant',
                'amount' => 10000,
                'remarks' => 'Scholarship recipient',
                'program_id' => $programIds[2] ?? 1,
                'is_paid' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('beneficiaries')->insert($beneficiaries);
    }
}
