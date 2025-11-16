<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CleanupExpiredVerificationCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'verification:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired verification codes from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of expired verification codes...');
        
        $cleanedCount = User::cleanupExpiredVerificationCodes();
        
        if ($cleanedCount > 0) {
            $this->info("✅ Cleaned up {$cleanedCount} expired verification codes.");
        } else {
            $this->info('✅ No expired verification codes found.');
        }
        
        // Also check for users with expired codes that might have been missed
        $usersWithExpiredCodes = User::whereNotNull('verification_code')
            ->where('verification_code_expires_at', '<', now())
            ->get();
            
        if ($usersWithExpiredCodes->count() > 0) {
            $this->warn("Found {$usersWithExpiredCodes->count()} users with expired codes that weren't cleaned up.");
            
            foreach ($usersWithExpiredCodes as $user) {
                $user->update([
                    'verification_code' => null,
                    'verification_code_expires_at' => null,
                ]);
                $this->line("  - Cleared expired code for user: {$user->email}");
            }
        }
        
        $this->info('Verification code cleanup completed!');
        
        return 0;
    }
}
