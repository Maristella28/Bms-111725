<?php

namespace App\Console\Commands;

use App\Models\HouseholdSurveySchedule;
use Illuminate\Console\Command;

class RunScheduledSurveys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'surveys:run-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run all due survey schedules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for due survey schedules...');

        $dueSchedules = HouseholdSurveySchedule::getDueSchedules();

        if ($dueSchedules->isEmpty()) {
            $this->info('No schedules due at this time.');
            return 0;
        }

        $this->info("Found {$dueSchedules->count()} due schedule(s).");

        $totalSurveysSent = 0;

        foreach ($dueSchedules as $schedule) {
            try {
                $this->info("Running schedule: {$schedule->name} (ID: {$schedule->id})");
                
                $surveysSent = $schedule->execute();
                $totalSurveysSent += $surveysSent;

                $this->info("✓ Sent {$surveysSent} surveys for '{$schedule->name}'");
            } catch (\Exception $e) {
                $this->error("✗ Failed to run schedule '{$schedule->name}': " . $e->getMessage());
            }
        }

        $this->info("----------------------------------");
        $this->info("Total surveys sent: {$totalSurveysSent}");
        $this->info("Scheduled survey run completed!");

        return 0;
    }
}

