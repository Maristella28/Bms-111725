<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== User Role Checker ===\n\n";

try {
    // Get all users and their roles
    $users = User::all(['id', 'name', 'email', 'role']);
    
    echo "All users in the system:\n";
    echo str_repeat("-", 80) . "\n";
    printf("%-5s %-30s %-30s %-15s\n", "ID", "Name", "Email", "Role");
    echo str_repeat("-", 80) . "\n";
    
    foreach ($users as $user) {
        printf("%-5s %-30s %-30s %-15s\n", 
            $user->id, 
            substr($user->name, 0, 30), 
            substr($user->email, 0, 30), 
            $user->role
        );
    }
    
    echo str_repeat("-", 80) . "\n\n";
    
    // Check for admin users
    $adminUsers = User::where('role', 'admin')->get();
    
    if ($adminUsers->count() > 0) {
        echo "Admin users found:\n";
        foreach ($adminUsers as $admin) {
            echo "  - ID: {$admin->id}, Name: {$admin->name}, Email: {$admin->email}\n";
        }
    } else {
        echo "❌ No admin users found!\n";
        echo "You need at least one admin user to manage staff permissions.\n\n";
        
        echo "To create an admin user, you can:\n";
        echo "1. Run: php artisan tinker\n";
        echo "2. Then run: User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password'), 'role' => 'admin']);\n";
        echo "3. Or use the registration endpoint with role: 'admin'\n\n";
    }
    
    // Check for staff users
    $staffUsers = User::where('role', 'staff')->get();
    
    if ($staffUsers->count() > 0) {
        echo "Staff users found:\n";
        foreach ($staffUsers as $staff) {
            echo "  - ID: {$staff->id}, Name: {$staff->name}, Email: {$staff->email}\n";
        }
    } else {
        echo "No staff users found.\n";
    }
    
    echo "\n=== Summary ===\n";
    echo "Total users: " . $users->count() . "\n";
    echo "Admin users: " . $adminUsers->count() . "\n";
    echo "Staff users: " . $staffUsers->count() . "\n";
    
    if ($adminUsers->count() === 0) {
        echo "\n⚠️  WARNING: No admin users found! You cannot update staff permissions without an admin user.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
