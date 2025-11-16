<?php

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306;dbname=e_gov_bms',
        'root',
        '',
        [PDO::ATTR_TIMEOUT => 5, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✓ Database connection successful\n";
    
    // Test a simple query
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "✓ Found $count users in database\n";
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

