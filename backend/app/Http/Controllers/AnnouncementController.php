<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\User;
use App\Notifications\AnnouncementCreatedNotification;
use App\Jobs\SendAnnouncementNotifications;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon; // For date parsing

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        // Auto-promote any due scheduled announcements to posted
        Announcement::where('status', 'scheduled')
            ->where('published_at', '<=', now())
            ->update(['status' => 'posted']);

        $query = Announcement::orderBy('created_at', 'desc');

        // ✅ Safe check for user role
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            // Show posted and due scheduled posts to non-admins
            $query->where(function ($q) {
                $q->where('status', 'posted')
                  ->orWhere(function ($q2) {
                      $q2->where('status', 'scheduled')
                         ->where('published_at', '<=', now());
                  });
            });
        }

        $announcements = $query->get()->map(function ($a) {
            $a->image_url = $a->image ? asset('storage/' . $a->image) : null;
            return $a;
        });

        return response()->json(['announcements' => $announcements], 200);
    }

    public function store(Request $request)
    {
        Log::info('Announcement STORE called (creating new)', [
            'title' => $request->input('title'),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'has_id' => $request->has('id'),
        ]);
        
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'published_at'  => 'nullable|date', // optional schedule datetime
        ]);

        // Determine publish time and status
        $publishedAt = $request->input('published_at')
            ? Carbon::parse($request->input('published_at'))
            : now();

        $status = $publishedAt->isFuture() ? 'scheduled' : 'posted';

        $data = [
            'title'        => $validated['title'],
            'content'      => $validated['content'],
            'published_at' => $publishedAt,
            'status'       => $status,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create($data);
        
        // Log announcement creation
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logCreated($announcement, $request);
        }

        // Send notifications to all residents when announcement is posted (not scheduled)
        // Dispatch to queue/background to prevent timeout
        if ($status === 'posted') {
            // Dispatch job to run in background (will queue if queue is configured, or run after response)
            SendAnnouncementNotifications::dispatch($announcement)->afterResponse();
        }

        return response()->json([
            'message' => 'Announcement created successfully.',
            'announcement' => $announcement
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        $announcement->image_url = $announcement->image ? asset('storage/' . $announcement->image) : null;

        return response()->json(['announcement' => $announcement]);
    }

    public function update(Request $request, $id)
    {
        // Get the announcement by ID (route parameter)
        $announcement = Announcement::find($id);
        
        // Verify the announcement exists
        if (!$announcement) {
            Log::error('Announcement update called but announcement not found', [
                'requested_id' => $id,
                'request_url' => $request->fullUrl(),
                'request_method' => $request->method(),
            ]);
            return response()->json(['message' => 'Announcement not found'], 404);
        }
        
        Log::info('Announcement UPDATE called (updating existing)', [
            'announcement_id' => $announcement->id,
            'existing_title' => $announcement->title,
            'new_title' => $request->input('title'),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
        ]);
        
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'published_at'  => 'nullable|date',
            'status'        => 'nullable|in:draft,posted,scheduled',
        ]);

        $announcement->title = $validated['title'];
        $announcement->content = $validated['content'];

        if ($request->has('published_at')) {
            $publishedAt = Carbon::parse($request->input('published_at'));
            $announcement->published_at = $publishedAt;
            // If publish date is changed to future/past, adjust status if not explicitly provided
            if (!$request->has('status')) {
                $announcement->status = $publishedAt->isFuture() ? 'scheduled' : 'posted';
            }
        }

        if ($request->has('status')) {
            $announcement->status = $request->input('status');
        }

        // Handle image removal or update
        $removeImage = $request->has('remove_image') && 
                       ($request->input('remove_image') === '1' || 
                        $request->input('remove_image') === 1 || 
                        $request->input('remove_image') === true ||
                        $request->input('remove_image') === 'true');
        
        if ($removeImage) {
            // User wants to remove the existing image
            if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
                Storage::disk('public')->delete($announcement->image);
            }
            $announcement->image = null;
        } elseif ($request->hasFile('image')) {
            // User uploaded a new image
            // Delete old image if exists
            if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
                Storage::disk('public')->delete($announcement->image);
            }

            $announcement->image = $request->file('image')->store('announcements', 'public');
        }
        // If neither remove_image nor new file, keep existing image (no change)

        $oldValues = $announcement->getOriginal();
        $announcement->save();
        
        // Log announcement update
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logUpdated($announcement, $oldValues, $request);
        }

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'announcement' => $announcement->fresh()
        ]);
    }

    public function destroy($id)
    {
        // Get the announcement by ID (route parameter)
        $announcement = Announcement::find($id);
        
        // Verify the announcement exists
        if (!$announcement) {
            Log::error('Announcement delete called but announcement not found', [
                'requested_id' => $id,
                'request_url' => request()->fullUrl(),
                'request_method' => request()->method(),
            ]);
            return response()->json(['message' => 'Announcement not found'], 404);
        }
        
        Log::info('Announcement DELETE called', [
            'announcement_id' => $announcement->id,
            'title' => $announcement->title,
            'method' => request()->method(),
            'url' => request()->fullUrl(),
        ]);
        
        // Delete the image if it exists
        if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
            Storage::disk('public')->delete($announcement->image);
            Log::info('Announcement image deleted', ['image_path' => $announcement->image]);
        }

        // Log announcement deletion
        $user = Auth::user();
        if ($user) {
            ActivityLogService::logDeleted($announcement, request());
        }
        
        // Delete the announcement
        $deleted = $announcement->delete();
        
        if ($deleted) {
            Log::info('Announcement successfully deleted', [
                'announcement_id' => $id,
                'title' => $announcement->title,
            ]);
            return response()->json(['message' => 'Announcement deleted successfully.']);
        } else {
            Log::error('Failed to delete announcement', [
                'announcement_id' => $id,
            ]);
            return response()->json(['message' => 'Failed to delete announcement.'], 500);
        }
    }

    public function toggleStatus(Announcement $announcement)
    {
        // Cycle: draft -> posted; posted -> draft; scheduled -> draft
        if ($announcement->status === 'posted') {
            $announcement->status = 'draft';
        } else {
            $announcement->status = 'posted';
            // if setting to posted but it's scheduled in future, also set published_at to now
            if ($announcement->published_at && Carbon::parse($announcement->published_at)->isFuture()) {
                $announcement->published_at = now();
            }
            
            // Send notifications to all residents when status changes to 'posted'
            // Dispatch to queue/background to prevent timeout
            SendAnnouncementNotifications::dispatch($announcement)->afterResponse();
        }

        $announcement->save();

        return response()->json([
            'message' => 'Status updated',
            'status' => $announcement->status
        ]);
    }

    /**
     * Send notification to all residents about new announcement
     */
    private function notifyAllResidents(Announcement $announcement)
    {
        try {
            // Get all resident users (role = 'resident' or 'residents')
            $residentUsers = User::whereIn('role', ['resident', 'residents'])
                ->whereNotNull('email')
                ->get();

            $notification = new AnnouncementCreatedNotification($announcement);
            
            foreach ($residentUsers as $user) {
                try {
                    $user->notify($notification);
                } catch (\Exception $e) {
                    Log::warning('Failed to send announcement notification to user', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('Announcement notifications sent to all residents', [
                'announcement_id' => $announcement->id,
                'recipients_count' => $residentUsers->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send announcement notifications to residents', [
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
