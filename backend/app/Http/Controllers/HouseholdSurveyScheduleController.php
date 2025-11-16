<?php

namespace App\Http\Controllers;

use App\Models\HouseholdSurveySchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HouseholdSurveyScheduleController extends Controller
{
    /**
     * Get all survey schedules
     */
    public function index()
    {
        try {
            $schedules = HouseholdSurveySchedule::with('createdBy')
                ->orderBy('is_active', 'desc')
                ->orderBy('next_run_date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch survey schedules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedules',
            ], 500);
        }
    }

    /**
     * Create a new survey schedule
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'survey_type' => 'required|in:comprehensive,relocation,deceased,contact,quick',
            'notification_method' => 'required|in:email,sms,both',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,annually',
            'target_households' => 'required|in:all,specific',
            'specific_household_ids' => 'nullable|array',
            'custom_message' => 'nullable|string',
            'is_active' => 'boolean',
            'start_date' => 'required|date',
            'scheduled_time' => 'required',
            'day_of_week' => 'nullable|integer|between:0,6',
            'day_of_month' => 'nullable|integer|between:1,28',
        ]);

        try {
            $schedule = HouseholdSurveySchedule::create([
                'name' => $request->name,
                'survey_type' => $request->survey_type,
                'notification_method' => $request->notification_method,
                'frequency' => $request->frequency,
                'target_households' => $request->target_households,
                'specific_household_ids' => $request->specific_household_ids,
                'custom_message' => $request->custom_message,
                'is_active' => $request->is_active ?? true,
                'start_date' => $request->start_date,
                'scheduled_time' => $request->scheduled_time,
                'day_of_week' => $request->day_of_week,
                'day_of_month' => $request->day_of_month,
                'created_by_user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Schedule created successfully',
                'data' => $schedule,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a survey schedule
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'survey_type' => 'sometimes|required|in:comprehensive,relocation,deceased,contact,quick',
            'notification_method' => 'sometimes|required|in:email,sms,both',
            'frequency' => 'sometimes|required|in:daily,weekly,monthly,quarterly,annually',
            'target_households' => 'sometimes|required|in:all,specific',
            'specific_household_ids' => 'nullable|array',
            'custom_message' => 'nullable|string',
            'is_active' => 'boolean',
            'start_date' => 'sometimes|required|date',
            'scheduled_time' => 'sometimes|required',
            'day_of_week' => 'nullable|integer|between:0,6',
            'day_of_month' => 'nullable|integer|between:1,28',
        ]);

        try {
            $schedule = HouseholdSurveySchedule::findOrFail($id);
            $schedule->update($request->all());

            // Recalculate next run date if timing changed
            if ($request->has('frequency') || $request->has('scheduled_time') || 
                $request->has('day_of_week') || $request->has('day_of_month')) {
                $schedule->calculateNextRunDate();
                $schedule->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Schedule updated successfully',
                'data' => $schedule,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update schedule',
            ], 500);
        }
    }

    /**
     * Toggle schedule active status
     */
    public function toggle($id)
    {
        try {
            $schedule = HouseholdSurveySchedule::findOrFail($id);
            $schedule->is_active = !$schedule->is_active;
            
            if ($schedule->is_active) {
                // Recalculate next run when activating
                $schedule->calculateNextRunDate();
            }
            
            $schedule->save();

            return response()->json([
                'success' => true,
                'message' => $schedule->is_active ? 'Schedule activated' : 'Schedule paused',
                'data' => $schedule,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle schedule',
            ], 500);
        }
    }

    /**
     * Delete a survey schedule
     */
    public function destroy($id)
    {
        try {
            $schedule = HouseholdSurveySchedule::findOrFail($id);
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Schedule deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete schedule',
            ], 500);
        }
    }

    /**
     * Run a schedule immediately
     */
    public function runNow($id)
    {
        try {
            $schedule = HouseholdSurveySchedule::findOrFail($id);
            
            $surveysSent = $schedule->execute();

            return response()->json([
                'success' => true,
                'message' => "Schedule executed successfully. {$surveysSent} surveys sent.",
                'data' => [
                    'surveys_sent' => $surveysSent,
                    'schedule' => $schedule->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to run schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to run schedule: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get schedule statistics
     */
    public function statistics()
    {
        try {
            $totalSchedules = HouseholdSurveySchedule::count();
            $activeSchedules = HouseholdSurveySchedule::where('is_active', true)->count();
            $totalRuns = HouseholdSurveySchedule::sum('total_runs');
            $totalSurveysSent = HouseholdSurveySchedule::sum('surveys_sent');

            $dueSchedules = HouseholdSurveySchedule::where('is_active', true)
                ->whereNotNull('next_run_date')
                ->where('next_run_date', '<=', now()->addDay())
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_schedules' => $totalSchedules,
                    'active_schedules' => $activeSchedules,
                    'total_runs' => $totalRuns,
                    'total_surveys_sent' => $totalSurveysSent,
                    'due_schedules' => $dueSchedules,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get schedule statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics',
            ], 500);
        }
    }
}

