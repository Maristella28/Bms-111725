<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\StaffController;
use App\Models\User;
use Illuminate\Http\Request;

echo "=== Staff API Endpoint Test ===\n\n";

try {
    // Create a mock request
    $request = new Request();
    
    // Get an admin user to test with
    $adminUser = User::where('role', 'admin')->first();
    
    if (!$adminUser) {
        echo "❌ No admin user found for testing\n";
        exit;
    }
    
    echo "Testing with admin user: {$adminUser->name} ({$adminUser->email})\n\n";
    
    // Set the authenticated user
    $request->setUserResolver(function () use ($adminUser) {
        return $adminUser;
    });
    
    // Test the staff controller index method
    $controller = new StaffController();
    $response = $controller->index();
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content:\n";
    
    $data = json_decode($response->getContent(), true);
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
    
    if (isset($data['staff']) && is_array($data['staff'])) {
        echo "✅ Staff data found: " . count($data['staff']) . " records\n";
        
        foreach ($data['staff'] as $staff) {
            echo "  - ID: {$staff['id']}, Name: {$staff['name']}, Email: {$staff['email']}\n";
        }
    } else {
        echo "❌ No staff data in response\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
