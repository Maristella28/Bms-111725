<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Program;
use App\Models\ProgramApplicationForms;
use App\Models\ApplicationSubmission;

echo "🔍 Checking resident IDs for college students...\n\n";

// Get the new program
$program = Program::where('name', 'College Financial Assistance Program 2025')->first();

// Get the forms for this program
$forms = ProgramApplicationForms::where('program_id', $program->id)->get();
$registrationForm = $forms->where('title', 'Registration Form')->first();
$voterForm = $forms->where('title', 'Voter\'s Certificate')->first();

// Get all submissions for both forms
$allSubmissions = ApplicationSubmission::whereIn('form_id', [$registrationForm->id, $voterForm->id])
    ->where('status', 'submitted')
    ->get();

echo "Found {$allSubmissions->count()} submitted forms\n\n";

// Get unique resident IDs from submissions
$residentIds = $allSubmissions->pluck('resident_id')->unique()->sort();

echo "Resident IDs in submissions:\n";
foreach ($residentIds as $residentId) {
    echo "  - Resident ID: {$residentId}\n";
}

echo "\nResident ID range: {$residentIds->min()} to {$residentIds->max()}\n";

// Check which ones are from our college students (should be the last 50)
$last50ResidentIds = $residentIds->take(-50);
echo "\nLast 50 resident IDs (should be college students):\n";
foreach ($last50ResidentIds as $residentId) {
    echo "  - Resident ID: {$residentId}\n";
}
