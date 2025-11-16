<?php

echo "🏥 Creating Medical Assistance Program...\n\n";

// Database configuration
$host = 'localhost';
$dbname = 'e_gov_bms'; // Database name from .env file
$username = 'root'; // Adjust this to your database username
$password = ''; // Adjust this to your database password

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection established!\n\n";
    
    // Create the Medical Assistance Program
    $programData = [
        'name' => 'Medical Assistance Program',
        'description' => 'The Medical Assistance Program provides financial support to residents of Barangay Mamatid who require medical attention, hospitalization, laboratory tests, or prescribed medicines. It aims to help indigent families manage healthcare expenses and ensure that all residents have access to essential medical services. Applicants are required to submit valid medical documents such as prescriptions, medical certificates, or hospital bills for verification at the Barangay Social Services Office.',
        'start_date' => '2025-02-01',
        'end_date' => '2025-03-31',
        'status' => 'ongoing',
        'beneficiary_type' => 'Indigent Residents',
        'assistance_type' => 'Health & Medical Assistance',
        'amount' => 3000,
        'max_beneficiaries' => 100,
        'payout_date' => '2025-03-25',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Insert program
    $sql = "INSERT INTO programs (name, description, start_date, end_date, status, beneficiary_type, assistance_type, amount, max_beneficiaries, payout_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $programData['name'],
        $programData['description'],
        $programData['start_date'],
        $programData['end_date'],
        $programData['status'],
        $programData['beneficiary_type'],
        $programData['assistance_type'],
        $programData['amount'],
        $programData['max_beneficiaries'],
        $programData['payout_date'],
        $programData['created_at'],
        $programData['updated_at']
    ]);
    
    $programId = $pdo->lastInsertId();
    
    echo "✅ Medical Assistance Program created successfully!\n";
    echo "   Program ID: {$programId}\n";
    echo "   Name: {$programData['name']}\n";
    echo "   Status: {$programData['status']}\n";
    echo "   Start Date: {$programData['start_date']}\n";
    echo "   End Date: {$programData['end_date']}\n";
    echo "   Max Beneficiaries: {$programData['max_beneficiaries']}\n";
    echo "   Amount per Beneficiary: ₱{$programData['amount']}\n";
    echo "   Payout Date: {$programData['payout_date']}\n\n";
    
    // Create sample beneficiaries for the program
    $beneficiariesData = [
        [
            'program_id' => $programId,
            'name' => 'Maria Santos',
            'beneficiary_type' => 'Indigent Residents',
            'status' => 'Disbursed',
            'assistance_type' => 'Health & Medical Assistance',
            'amount' => 3000,
            'contact_number' => '09123456789',
            'full_address' => '123 Mamatid Street, Barangay Mamatid',
            'application_date' => '2025-01-15',
            'approved_date' => '2025-01-20',
            'is_paid' => 1,
            'created_at' => '2025-01-15 08:30:00',
            'updated_at' => '2025-01-20 14:15:00'
        ],
        [
            'program_id' => $programId,
            'name' => 'Juan Dela Cruz',
            'beneficiary_type' => 'Indigent Residents',
            'status' => 'Completed',
            'assistance_type' => 'Health & Medical Assistance',
            'amount' => 3000,
            'contact_number' => '09234567890',
            'full_address' => '456 Mamatid Avenue, Barangay Mamatid',
            'application_date' => '2025-01-16',
            'approved_date' => '2025-01-22',
            'is_paid' => 1,
            'created_at' => '2025-01-16 09:15:00',
            'updated_at' => '2025-01-22 10:30:00'
        ],
        [
            'program_id' => $programId,
            'name' => 'Ana Rodriguez',
            'beneficiary_type' => 'Indigent Residents',
            'status' => 'Pending',
            'assistance_type' => 'Health & Medical Assistance',
            'amount' => 3000,
            'contact_number' => '09345678901',
            'full_address' => '789 Mamatid Road, Barangay Mamatid',
            'application_date' => '2025-01-18',
            'approved_date' => null,
            'is_paid' => 0,
            'created_at' => '2025-01-18 11:45:00',
            'updated_at' => '2025-01-18 11:45:00'
        ],
        [
            'program_id' => $programId,
            'name' => 'Pedro Garcia',
            'beneficiary_type' => 'Indigent Residents',
            'status' => 'Approved',
            'assistance_type' => 'Health & Medical Assistance',
            'amount' => 3000,
            'contact_number' => '09456789012',
            'full_address' => '321 Mamatid Boulevard, Barangay Mamatid',
            'application_date' => '2025-01-19',
            'approved_date' => '2025-01-21',
            'is_paid' => 0,
            'created_at' => '2025-01-19 13:20:00',
            'updated_at' => '2025-01-21 16:45:00'
        ],
        [
            'program_id' => $programId,
            'name' => 'Carmen Lopez',
            'beneficiary_type' => 'Indigent Residents',
            'status' => 'Disbursed',
            'assistance_type' => 'Health & Medical Assistance',
            'amount' => 3000,
            'contact_number' => '09567890123',
            'full_address' => '654 Mamatid Lane, Barangay Mamatid',
            'application_date' => '2025-01-20',
            'approved_date' => '2025-01-23',
            'is_paid' => 1,
            'created_at' => '2025-01-20 14:30:00',
            'updated_at' => '2025-01-23 09:15:00'
        ]
    ];
    
    echo "👥 Creating sample beneficiaries...\n";
    
    $beneficiarySql = "INSERT INTO beneficiaries (program_id, name, beneficiary_type, status, assistance_type, amount, contact_number, full_address, application_date, approved_date, is_paid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $beneficiaryStmt = $pdo->prepare($beneficiarySql);
    
    foreach ($beneficiariesData as $beneficiaryData) {
        $beneficiaryStmt->execute([
            $beneficiaryData['program_id'],
            $beneficiaryData['name'],
            $beneficiaryData['beneficiary_type'],
            $beneficiaryData['status'],
            $beneficiaryData['assistance_type'],
            $beneficiaryData['amount'],
            $beneficiaryData['contact_number'],
            $beneficiaryData['full_address'],
            $beneficiaryData['application_date'],
            $beneficiaryData['approved_date'],
            $beneficiaryData['is_paid'],
            $beneficiaryData['created_at'],
            $beneficiaryData['updated_at']
        ]);
        
        echo "   ✅ {$beneficiaryData['name']} - {$beneficiaryData['status']} - ₱{$beneficiaryData['amount']}\n";
    }
    
    echo "\n🎉 Medical Assistance Program and beneficiaries created successfully!\n";
    echo "📊 Program Summary:\n";
    echo "   - Program: {$programData['name']}\n";
    echo "   - Total Beneficiaries: " . count($beneficiariesData) . "\n";
    echo "   - Paid Beneficiaries: " . count(array_filter($beneficiariesData, fn($b) => $b['is_paid'])) . "\n";
    echo "   - Pending Beneficiaries: " . count(array_filter($beneficiariesData, fn($b) => !$b['is_paid'])) . "\n";
    echo "   - Total Amount Disbursed: ₱" . array_sum(array_column(array_filter($beneficiariesData, fn($b) => $b['is_paid']), 'amount')) . "\n";
    echo "   - Max Program Capacity: {$programData['max_beneficiaries']} beneficiaries\n\n";
    
    echo "🔄 Please refresh your application to see the new program.\n";
    echo "📋 The program is now available in the Social Services module.\n";
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
    echo "🔍 Please check your database configuration and try again.\n";
} catch (Exception $e) {
    echo "❌ Error creating Medical Assistance Program: " . $e->getMessage() . "\n";
    echo "🔍 Please check your database connection and try again.\n";
}
?>
