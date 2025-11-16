<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class InactiveRecordsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder creates test data for the "For Review" flagging system
     * that automatically flags records with no activity for 1 year.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('🚀 Starting Inactive Records Seeder...');

        // Scenario 1: Active user - logged in recently (within 6 months)
        $this->createTestResident([
            'scenario' => 'Active User - Recent Activity',
            'name' => 'John Active',
            'email' => 'john.active@test.com',
            'last_activity_at' => Carbon::now()->subMonths(3),
            'last_modified' => Carbon::now()->subMonths(2),
            'for_review' => false,
            'residency_status' => 'active',
        ]);

        // Scenario 2: User approaching inactivity threshold (11 months)
        $this->createTestResident([
            'scenario' => 'User Approaching Threshold - 11 Months',
            'name' => 'Sarah Almost',
            'email' => 'sarah.almost@test.com',
            'last_activity_at' => Carbon::now()->subMonths(11),
            'last_modified' => Carbon::now()->subMonths(11)->subDays(5),
            'for_review' => false,
            'residency_status' => 'active',
        ]);

        // Scenario 3: User exactly at 1 year threshold
        $this->createTestResident([
            'scenario' => 'User At Threshold - Exactly 12 Months',
            'name' => 'Mike Threshold',
            'email' => 'mike.threshold@test.com',
            'last_activity_at' => Carbon::now()->subYear(),
            'last_modified' => Carbon::now()->subYear()->subDays(2),
            'for_review' => true, // Should be flagged
            'residency_status' => 'for_review',
        ]);

        // Scenario 4: Inactive user - 13 months no activity
        $this->createTestResident([
            'scenario' => 'Inactive User - 13 Months',
            'name' => 'Emma Inactive',
            'email' => 'emma.inactive@test.com',
            'last_activity_at' => Carbon::now()->subMonths(13),
            'last_modified' => Carbon::now()->subMonths(14),
            'for_review' => true,
            'residency_status' => 'for_review',
        ]);

        // Scenario 5: Very inactive user - 18 months
        $this->createTestResident([
            'scenario' => 'Very Inactive User - 18 Months',
            'name' => 'David Longago',
            'email' => 'david.longago@test.com',
            'last_activity_at' => Carbon::now()->subMonths(18),
            'last_modified' => Carbon::now()->subMonths(18)->subDays(10),
            'for_review' => true,
            'residency_status' => 'for_review',
        ]);

        // Scenario 6: User with no login activity but recent record update
        $this->createTestResident([
            'scenario' => 'No Login But Recent Update',
            'name' => 'Lisa Updated',
            'email' => 'lisa.updated@test.com',
            'last_activity_at' => Carbon::now()->subYears(2), // Old login
            'last_modified' => Carbon::now()->subMonth(), // Recent update
            'for_review' => false, // Should NOT be flagged (recent update)
            'residency_status' => 'active',
        ]);

        // Scenario 7: User with recent login but old record
        $this->createTestResident([
            'scenario' => 'Recent Login But Old Record',
            'name' => 'Tom Logged',
            'email' => 'tom.logged@test.com',
            'last_activity_at' => Carbon::now()->subDays(15), // Recent login
            'last_modified' => Carbon::now()->subMonths(18), // Old update
            'for_review' => false, // Should NOT be flagged (recent login)
            'residency_status' => 'active',
        ]);

        // Scenario 8: User with no activity at all (null dates)
        $this->createTestResident([
            'scenario' => 'No Activity Ever',
            'name' => 'Never Active',
            'email' => 'never.active@test.com',
            'last_activity_at' => null,
            'last_modified' => null,
            'for_review' => true,
            'residency_status' => 'for_review',
        ]);

        // Scenario 9: Extremely old user - 3 years inactive
        $this->createTestResident([
            'scenario' => 'Ancient User - 3 Years Inactive',
            'name' => 'Robert Ancient',
            'email' => 'robert.ancient@test.com',
            'last_activity_at' => Carbon::now()->subYears(3),
            'last_modified' => Carbon::now()->subYears(3)->subMonths(2),
            'for_review' => true,
            'residency_status' => 'for_review',
        ]);

        // Scenario 10: User flagged for review with old status notes
        $this->createTestResident([
            'scenario' => 'Previously Flagged User',
            'name' => 'Maria Flagged',
            'email' => 'maria.flagged@test.com',
            'last_activity_at' => Carbon::now()->subMonths(15),
            'last_modified' => Carbon::now()->subMonths(15),
            'for_review' => true,
            'residency_status' => 'for_review',
            'status_notes' => 'Automatically flagged for review due to 1 year of inactivity',
        ]);

        // Scenario 11: Relocated user (should not be affected by flagging)
        $this->createTestResident([
            'scenario' => 'Relocated User - Should Not Flag',
            'name' => 'Carlos Relocated',
            'email' => 'carlos.relocated@test.com',
            'last_activity_at' => Carbon::now()->subYears(2),
            'last_modified' => Carbon::now()->subYears(2),
            'for_review' => false,
            'residency_status' => 'relocated',
        ]);

        // Scenario 12: Deceased user (should not be affected by flagging)
        $this->createTestResident([
            'scenario' => 'Deceased User - Should Not Flag',
            'name' => 'Anna Deceased',
            'email' => 'anna.deceased@test.com',
            'last_activity_at' => Carbon::now()->subYears(2),
            'last_modified' => Carbon::now()->subYears(2),
            'for_review' => false,
            'residency_status' => 'deceased',
        ]);

        $this->command->info('');
        $this->command->info('✅ Inactive Records Seeder completed!');
        $this->command->info('📊 Summary:');
        $this->command->info('   - 12 test users/residents created');
        $this->command->info('   - Various activity scenarios covered');
        $this->command->info('   - Ready to test flagging system');
        $this->command->info('');
        $this->command->info('💡 To test the flagging system:');
        $this->command->info('   php artisan residents:check-review');
        $this->command->info('   php artisan users:check-inactive --dry-run');
    }

    /**
     * Create a test resident with user and profile
     */
    private function createTestResident($data)
    {
        $this->command->info("📝 Creating: {$data['scenario']}");

        // Create User
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make('password123'),
            'role' => 'residents',
            'email_verified_at' => Carbon::now()->subYear(),
            'has_logged_in' => true,
            'privacy_policy_accepted' => true,
            'privacy_policy_accepted_at' => Carbon::now()->subYear(),
            'residency_status' => $data['residency_status'],
            'last_activity_at' => $data['last_activity_at'],
            'status_notes' => $data['status_notes'] ?? null,
        ]);

        // Generate resident ID
        $residentId = 'TEST-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);

        // Create Profile
        $profile = Profile::create([
            'user_id' => $user->id,
            'resident_id' => $residentId,
            'first_name' => explode(' ', $data['name'])[0],
            'last_name' => explode(' ', $data['name'])[1] ?? 'User',
            'middle_name' => 'Test',
            'name_suffix' => null,
            'birth_date' => Carbon::now()->subYears(rand(20, 60)),
            'birth_place' => 'Test City',
            'age' => rand(20, 60),
            'nationality' => 'Filipino',
            'sex' => rand(0, 1) ? 'Male' : 'Female',
            'civil_status' => 'Single',
            'religion' => 'Catholic',
            'email' => $data['email'],
            'mobile_number' => '09' . rand(100000000, 999999999),
            'current_address' => 'Test Address, Test City',
            'years_in_barangay' => rand(1, 20),
            'voter_status' => 'registered',
            'housing_type' => 'owned',
            'educational_attainment' => 'College Graduate',
            'occupation_type' => 'employed',
            'profile_completed' => true,
            'my_benefits_enabled' => true,
        ]);

        // Create Resident (account_status will be set automatically by the model/database)
        $resident = Resident::create([
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'resident_id' => $residentId,
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'name_suffix' => null,
            'birth_date' => $profile->birth_date,
            'birth_place' => $profile->birth_place,
            'age' => $profile->age,
            'nationality' => $profile->nationality,
            'sex' => $profile->sex,
            'civil_status' => $profile->civil_status,
            'religion' => $profile->religion,
            'email' => $profile->email,
            'mobile_number' => $profile->mobile_number,
            'current_address' => $profile->current_address,
            'years_in_barangay' => $profile->years_in_barangay,
            'voter_status' => $profile->voter_status,
            'housing_type' => $profile->housing_type,
            'educational_attainment' => $profile->educational_attainment,
            'occupation_type' => $profile->occupation_type,
            'household_no' => 'HH-' . rand(1000, 9999),
            'household_role' => 'head',
            'head_of_family' => true,
            'verification_status' => 'approved',
            'last_modified' => $data['last_modified'],
            'for_review' => $data['for_review'],
        ]);

        $this->command->line("   ✓ User: {$user->email} (ID: {$user->id})");
        $this->command->line("   ✓ Resident: {$residentId} (For Review: " . ($resident->for_review ? 'YES' : 'NO') . ")");
        $this->command->line("   ✓ Last Activity: " . ($user->last_activity_at ? $user->last_activity_at->format('Y-m-d H:i:s') : 'Never'));
        $this->command->line("   ✓ Last Modified: " . ($resident->last_modified ? $resident->last_modified->format('Y-m-d H:i:s') : 'Never'));
        $this->command->line('');
    }
}

