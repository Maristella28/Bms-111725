<?php

/**
 * Manual Script to Inject Inactive Records Test Data
 * 
 * This script runs the InactiveRecordsSeeder to populate the database
 * with test data for the "For Review" flagging system.
 * 
 * Usage: php inject_inactive_records.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔═══════════════════════════════════════════════════════════════╗\n";
echo "║     INACTIVE RECORDS TEST DATA INJECTION SCRIPT              ║\n";
echo "║     For Review Flagging System                                ║\n";
echo "╚═══════════════════════════════════════════════════════════════╝\n\n";

try {
    echo "🔄 Running InactiveRecordsSeeder...\n\n";
    
    $seeder = new \Database\Seeders\InactiveRecordsSeeder();
    
    // Create a mock command object
    $mockCommand = new class extends \Illuminate\Console\Command {
        protected $signature = 'mock:command';
        protected $description = 'Mock command for seeder';
        
        public function handle() {}
        
        public function info($message, $verbosity = null) { 
            echo "ℹ️  $message\n"; 
        }
        
        public function line($message, $style = null, $verbosity = null) { 
            echo "   $message\n"; 
        }
        
        public function warn($message, $verbosity = null) { 
            echo "⚠️  $message\n"; 
        }
        
        public function error($message, $verbosity = null) { 
            echo "❌ $message\n"; 
        }
    };
    
    $seeder->setCommand($mockCommand);
    $seeder->run();
    
    echo "\n╔═══════════════════════════════════════════════════════════════╗\n";
    echo "║                    NEXT STEPS                                 ║\n";
    echo "╚═══════════════════════════════════════════════════════════════╝\n\n";
    
    echo "1️⃣  Check the database:\n";
    echo "   SELECT name, email, last_activity_at, residency_status\n";
    echo "   FROM users WHERE email LIKE '%@test.com';\n\n";
    
    echo "   SELECT resident_id, first_name, last_name, for_review, last_modified\n";
    echo "   FROM residents WHERE email LIKE '%@test.com';\n\n";
    
    echo "2️⃣  Test the flagging commands:\n";
    echo "   php artisan residents:check-review\n";
    echo "   php artisan users:check-inactive --dry-run\n\n";
    
    echo "3️⃣  View results in the application:\n";
    echo "   - Login to the admin dashboard\n";
    echo "   - Navigate to Residents Records\n";
    echo "   - Look for 'For Review' badges/filters\n\n";
    
    echo "✅ Data injection completed successfully!\n";
    
} catch (\Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n🔍 Stack Trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

