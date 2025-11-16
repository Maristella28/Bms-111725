<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Staff;

echo "=== Staff Records Check ===\n\n";

try {
    // Get all staff records
    $staff = Staff::all(['id', 'name', 'email', 'active', 'created_at', 'updated_at']);
    
    echo "All staff records:\n";
    echo str_repeat("-", 100) . "\n";
    printf("%-5s %-30s %-30s %-8s %-20s %-20s\n", "ID", "Name", "Email", "Active", "Created", "Updated");
    echo str_repeat("-", 100) . "\n";
    
    foreach ($staff as $s) {
        printf("%-5s %-30s %-30s %-8s %-20s %-20s\n", 
            $s->id, 
            substr($s->name, 0, 30), 
            substr($s->email, 0, 30), 
            $s->active ? 'Yes' : 'No',
            $s->created_at->format('Y-m-d H:i:s'),
            $s->updated_at->format('Y-m-d H:i:s')
        );
    }
    
    echo str_repeat("-", 100) . "\n\n";
    
    // Check active staff
    $activeStaff = Staff::where('active', true)->get();
    echo "Active staff count: " . $activeStaff->count() . "\n";
    
    // Check inactive staff
    $inactiveStaff = Staff::where('active', false)->get();
    echo "Inactive staff count: " . $inactiveStaff->count() . "\n";
    
    // Check recent staff (last 24 hours)
    $recentStaff = Staff::where('created_at', '>=', now()->subDay())->get();
    echo "Staff created in last 24 hours: " . $recentStaff->count() . "\n";
    
    if ($recentStaff->count() > 0) {
        echo "\nRecent staff:\n";
        foreach ($recentStaff as $s) {
            echo "  - ID: {$s->id}, Name: {$s->name}, Email: {$s->email}, Active: " . ($s->active ? 'Yes' : 'No') . "\n";
        }
    }
    
    // Test the API endpoint logic
    echo "\n=== API Endpoint Test ===\n";
    $apiStaff = Staff::where('active', true)->get();
    echo "Staff returned by API endpoint (active=true): " . $apiStaff->count() . "\n";
    
    if ($apiStaff->count() > 0) {
        echo "API would return these staff:\n";
        foreach ($apiStaff as $s) {
            echo "  - ID: {$s->id}, Name: {$s->name}, Email: {$s->email}\n";
        }
    } else {
        echo "❌ No active staff found! This explains why the frontend shows no data.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
