<?php

/**
 * Cleanup and Inject Script
 * 
 * This script cleans up old test data and injects fresh test data
 * for the "For Review" flagging system.
 * 
 * Usage: php cleanup_and_inject.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔═══════════════════════════════════════════════════════════════╗\n";
echo "║     CLEANUP & INJECT TEST DATA SCRIPT                        ║\n";
echo "║     For Review Flagging System                                ║\n";
echo "╚═══════════════════════════════════════════════════════════════╝\n\n";

try {
    echo "🧹 STEP 1: Cleaning up old test data...\n\n";
    
    $emails = [
        'john.active@test.com',
        'sarah.almost@test.com', 
        'mike.threshold@test.com',
        'emma.inactive@test.com',
        'david.longago@test.com',
        'lisa.updated@test.com',
        'tom.logged@test.com',
        'never.active@test.com',
        'robert.ancient@test.com',
        'maria.flagged@test.com',
        'carlos.relocated@test.com',
        'anna.deceased@test.com'
    ];
    
    $deletedCount = 0;
    foreach ($emails as $email) {
        $user = \App\Models\User::where('email', $email)->first();
        if ($user) {
            // Delete related resident
            if ($user->resident) {
                $user->resident->delete();
            }
            // Delete related profile
            if ($user->profile) {
                $user->profile->delete();
            }
            // Delete user
            $user->delete();
            echo "   ✓ Deleted: {$email}\n";
            $deletedCount++;
        }
    }
    
    if ($deletedCount > 0) {
        echo "\n✅ Cleanup complete! Deleted {$deletedCount} test user(s).\n\n";
    } else {
        echo "\nℹ️  No test data found to clean up.\n\n";
    }
    
    echo "─────────────────────────────────────────────────────────────\n\n";
    echo "🚀 STEP 2: Injecting fresh test data...\n\n";
    
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
    echo "║                    SUCCESS!                                   ║\n";
    echo "╚═══════════════════════════════════════════════════════════════╝\n\n";
    
    echo "✅ All done! Test data has been cleaned up and re-injected.\n\n";
    echo "📋 NEXT STEPS:\n";
    echo "   1. Refresh your browser on the Residents Records page\n";
    echo "   2. Select 'For Review' in the status filter\n";
    echo "   3. You should see residents with orange badges!\n\n";
    
    echo "🔍 VERIFY IN DATABASE:\n";
    echo "   php artisan tinker\n";
    echo "   >>> \\App\\Models\\Resident::where('for_review', true)->count()\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n🔍 Stack Trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

