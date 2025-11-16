<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\AdminController;

// Test the residents method
$controller = new AdminController();

try {
    $response = $controller->residents();
    $data = $response->getData(true);
    
    echo "API Response:\n";
    echo json_encode($data, JSON_PRETTY_PRINT);
    echo "\n\n";
    
    if (isset($data['users'])) {
        echo "Users count: " . count($data['users']) . "\n";
        if (count($data['users']) > 0) {
            echo "First user structure:\n";
            echo json_encode($data['users'][0], JSON_PRETTY_PRINT);
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}






