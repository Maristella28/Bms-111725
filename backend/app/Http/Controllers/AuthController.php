<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\EmailVerificationMail;
use App\Mail\VerificationCodeMail;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Str;

use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new user (step 1: create user and send verification code)
     */
    public function register(Request $request)
    {
        \Log::info('Registration attempt:', $request->all());
        
        // Check if there's a recent registration attempt with the same email
        $recentUser = User::where('email', $request->email)
            ->where('created_at', '>', now()->subMinutes(5))
            ->first();
        
        if ($recentUser) {
            // If user exists but hasn't verified email yet, resend verification code
            if (!$recentUser->hasVerifiedEmail()) {
                // Generate new verification code
                $verificationCode = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
                
                $recentUser->update([
                    'verification_code' => $verificationCode,
                    'verification_code_expires_at' => now()->addMinute(),
                ]);
                
                // Update or create profile with latest registration data
                $profile = \App\Models\Profile::where('user_id', $recentUser->id)->first();
                if ($profile) {
                    // Update existing profile
                    $profile->update([
                        'first_name' => $request->first_name ?? $profile->first_name,
                        'middle_name' => $request->middle_name ?? $profile->middle_name,
                        'last_name' => $request->last_name ?? $profile->last_name,
                        'name_suffix' => $request->suffix ?? $profile->name_suffix,
                        'mobile_number' => $request->contact_number ?? $profile->mobile_number,
                        'sex' => $request->sex ?? $profile->sex,
                        'birth_date' => $request->birth_date ? \Carbon\Carbon::parse($request->birth_date)->format('Y-m-d') : $profile->birth_date,
                        'current_address' => $request->current_address ?? $profile->current_address,
                    ]);
                } else {
                    // Create new profile
                    $profile = \App\Models\Profile::create([
                        'user_id' => $recentUser->id,
                        'resident_id' => 'R-' . $recentUser->id . '-' . time(),
                        'first_name' => $request->first_name ?? '',
                        'middle_name' => $request->middle_name ?? '',
                        'last_name' => $request->last_name ?? '',
                        'name_suffix' => $request->suffix ?? '',
                        'email' => $request->email,
                        'mobile_number' => $request->contact_number ?? '',
                        'sex' => $request->sex ?? '',
                        'birth_date' => $request->birth_date ? \Carbon\Carbon::parse($request->birth_date)->format('Y-m-d') : null,
                        'current_address' => $request->current_address ?? '',
                        'verification_status' => 'pending',
                        'profile_completed' => false,
                    ]);
                }
                
                // Send verification code email
                Mail::to($recentUser->email)->send(new VerificationCodeMail($recentUser, $verificationCode));
                \Log::info('Resent verification code to existing unverified user:', [
                    'user_id' => $recentUser->id,
                    'email' => $recentUser->email,
                    'profile_id' => $profile->id
                ]);
                
                return response()->json([
                    'message' => 'Registration initiated. Please check your email for the verification code.',
                    'user_id' => $recentUser->id,
                    'email' => $recentUser->email,
                    'profile_id' => $profile->id,
                    'requires_verification' => true,
                ], 201);
            }
        }
        
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|unique:users',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    function ($attribute, $value, $fail) {
                        if (!preg_match('/[A-Z]/', $value)) {
                            $fail('The password must contain at least one uppercase letter.');
                        }
                        if (!preg_match('/[a-z]/', $value)) {
                            $fail('The password must contain at least one lowercase letter.');
                        }
                        if (!preg_match('/[0-9]/', $value)) {
                            $fail('The password must contain at least one number.');
                        }
                        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $value)) {
                            $fail('The password must contain at least one special character.');
                        }
                    },
                ],
                'role'     => 'nullable|string|in:admin,staff,treasurer,residents',
                'agree_privacy_policy' => 'required|accepted',
            ], [
                'agree_privacy_policy.required' => 'You must agree to the privacy policy to register.',
                'agree_privacy_policy.accepted' => 'You must accept the privacy policy to register.',
            ]);
            
            \Log::info('Validation passed:', $validated);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Registration validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            // Generate 6-digit verification code
            $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            \Log::info('Creating user with data:', [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role ?? 'residents',
                'verification_code' => $verificationCode
            ]);
            
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'residents',
                'verification_code' => $verificationCode,
                'verification_code_expires_at' => now()->addMinutes(5),
                'privacy_policy_accepted' => true,
                'privacy_policy_accepted_at' => now(),
            ]);

            // Create profile with registration data
            $profile = \App\Models\Profile::create([
                'user_id' => $user->id,
                'resident_id' => 'R-' . $user->id . '-' . time(),
                'first_name' => $request->first_name ?? '',
                'middle_name' => $request->middle_name ?? '',
                'last_name' => $request->last_name ?? '',
                'name_suffix' => $request->suffix ?? '',
                'email' => $request->email,
                'mobile_number' => $request->contact_number ?? '',
                'sex' => $request->sex ?? '',
                'birth_date' => $request->birth_date ? \Carbon\Carbon::parse($request->birth_date)->format('Y-m-d') : null,
                'current_address' => $request->address ?? '',
                'verification_status' => 'pending',
                'profile_completed' => false,
            ]);

            \Log::info('Profile created during registration:', [
                'user_id' => $user->id,
                'profile_id' => $profile->id,
                'first_name' => $profile->first_name,
                'last_name' => $profile->last_name,
                'email' => $profile->email
            ]);

            \Log::info('User created successfully:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'verification_code' => $user->verification_code,
                'verification_code_expires_at' => $user->verification_code_expires_at
            ]);

            // Log user registration
            ActivityLogService::logCreated($user, $request);

            // Send verification code email
            try {
                Mail::to($user->email)->send(new VerificationCodeMail($user, $verificationCode));
                \Log::info('Verification email sent successfully. Code: ' . $verificationCode);
            } catch (\Exception $mailError) {
                \Log::error('Failed to send verification email:', [
                    'error' => $mailError->getMessage(),
                    'user_id' => $user->id
                ]);
                // Log the code for testing purposes
                \Log::info('Verification code for testing: ' . $verificationCode);
                // Don't fail registration if email fails, just log it
            }

            return response()->json([
                'message' => 'Registration initiated. Please check your email for the verification code.',
                'user_id' => $user->id,
                'email' => $user->email,
                'profile_id' => $profile->id,
                'requires_verification' => true,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Registration failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify registration with code (step 2: verify code and complete registration)
     */
    public function verifyRegistration(Request $request)
    {
        \Log::info('Verification attempt:', $request->all());

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'verification_code' => 'required|string|size:6',
        ]);

        // Clean up expired verification codes first
        User::cleanupExpiredVerificationCodes();

        $user = User::findOrFail($request->user_id);

        \Log::info('User before verification:', $user->toArray());

        // Check if user has a verification code
        if (!$user->verification_code) {
            return response()->json(['message' => 'No verification code found. Please request a new one.', 'code_expired' => true], 400);
        }

        if ($user->isVerificationCodeExpired()) {
            // Clean up the expired code
            $user->update([
                'verification_code' => null,
                'verification_code_expires_at' => null,
            ]);
            return response()->json(['message' => 'Verification code has expired. Please request a new one.', 'code_expired' => true], 400);
        }

        if ($user->verification_code !== $request->verification_code) {
            return response()->json(['message' => 'Invalid verification code. Please try again.', 'invalid_code' => true], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);

        \Log::info('User after verification:', $user->fresh()->toArray());

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration completed successfully! You can now log in to your account.',
            'user' => $user->fresh(),
            'token' => $token,
            'email_verified' => true,
        ]);
    }

    /**
     * Resend verification code
     */
    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Clean up expired verification codes first
        User::cleanupExpiredVerificationCodes();

        $user = User::findOrFail($request->user_id);

        // Check if user is already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email is already verified.'
            ], 400);
        }

        // Check if a verification code was recently sent (prevent spam)
        if ($user->verification_code_expires_at &&
            $user->verification_code_expires_at->isFuture()) {
            return response()->json([
                'message' => 'Please wait for your current verification code to expire before requesting a new one.',
                'code_expires_at' => $user->verification_code_expires_at->toISOString(),
                'time_remaining' => $user->verification_code_expires_at->diffForHumans(),
            ], 429);
        }

        // Generate new verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->update([
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => now()->addMinutes(5), // 5 minutes expiry
        ]);

        // Send new verification code email
        try {
            Mail::to($user->email)->send(new VerificationCodeMail($user, $verificationCode));
            Log::info('Verification code email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'verification_code' => $verificationCode
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send verification code email:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            // Don't fail the request if email fails, just log it
        }

        return response()->json([
            'message' => 'New verification code sent successfully. Please check your inbox.'
        ]);
    }

    /**
     * Send verification email (legacy method - keeping for compatibility)
     */
    private function sendVerificationEmail($user)
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));
    }

    /**
     * Verify email address (legacy method - keeping for compatibility)
     */
    public function verifyEmail(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->email), $request->hash)) {
            return response()->json(['message' => 'Invalid verification link'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email verified successfully! You can now log in to your account.',
            'user' => $user
        ]);
    }

    /**
     * Resend verification email (legacy method - keeping for compatibility)
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified'], 400);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'message' => 'Verification email sent successfully. Please check your inbox.'
        ]);
    }

    /**
     * Login a user
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Clean up expired verification codes first
        User::cleanupExpiredVerificationCodes();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->getAuthPassword())) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            // Check if user has an expired verification code and clear it
            if ($user->isVerificationCodeExpired()) {
                $user->update([
                    'verification_code' => null,
                    'verification_code_expires_at' => null,
                ]);
            }
            
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'email_verified' => false,
                'user_id' => $user->id,
                'requires_verification' => true,
                'code_expired' => $user->isVerificationCodeExpired(),
            ], 403);
        }

        // Update last activity timestamp
        $user->updateLastActivity();

        $token = $user->createToken('api-token')->plainTextToken;

        // Log successful login
        ActivityLogService::logAuth('login', $request, $user);

        // OPTIMIZATION: Include basic user data in login response
        $userData = $user->toArray();
        
        // Add basic permissions based on role
        if ($user->role === 'admin') {
            $userData['permissions'] = [
                'dashboard' => true,
                'residents' => true,
                'documents' => true,
                'household' => true,
                'blotter' => true,
                'treasurer' => true,
                'officials' => true,
                'staff' => true,
                'communication' => true,
                'projects' => true,
                'social_services' => true,
                'command_center' => true,
                'inventory' => true,
                'logs' => true
            ];
        } else if ($user->role === 'staff') {
            $userData['permissions'] = [
                'dashboard' => true,
                'residents' => true,
                'social_services' => true
            ];
        } else {
            $userData['permissions'] = ['dashboard' => true];
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $userData,
            'token' => $token,
            'email_verified' => true,
        ]);
    }

    /**
     * Logout a user
     */
    public function logout(Request $request)
    {
        // Log logout before deleting tokens
        ActivityLogService::logAuth('logout', $request, $request->user());

        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get authenticated user with profile
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->loadMissing('profile'),
        ]);
    }

    /**
     * Validate name uniqueness (first_name + middle_name + last_name + suffix combination)
     * This ensures that people with the same first, middle, and last names but different suffixes
     * are considered different individuals (e.g., James Marc Puada Jr. vs James Marc Puada Sr.).
     */
    public function validateNameUniqueness(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'name_suffix' => 'nullable|string|max:255',
        ]);

        $firstName = trim($request->first_name);
        $middleName = trim($request->middle_name ?? '');
        $lastName = trim($request->last_name);
        $nameSuffix = trim($request->name_suffix ?? '');

        // Check if a profile with the same first_name, middle_name, last_name, and name_suffix already exists (case-insensitive)
        // This considers the full name combination to identify unique individuals
        $query = \App\Models\Profile::whereRaw('LOWER(first_name) = ? AND LOWER(last_name) = ?', [
            strtolower($firstName),
            strtolower($lastName)
        ]);

        // Handle middle name comparison (including empty/null cases)
        if (empty($middleName)) {
            // If middle name is empty, check for profiles with empty or null middle names
            $query->where(function($q) {
                $q->whereNull('middle_name')
                  ->orWhere('middle_name', '');
            });
        } else {
            // If middle name is provided, check for exact match (case-insensitive)
            $query->whereRaw('LOWER(middle_name) = ?', [strtolower($middleName)]);
        }

        // Handle suffix comparison (including empty/null cases)
        if (empty($nameSuffix)) {
            // If suffix is empty, check for profiles with empty or null suffixes
            $query->where(function($q) {
                $q->whereNull('name_suffix')
                  ->orWhere('name_suffix', '');
            });
        } else {
            // If suffix is provided, check for exact match (case-insensitive)
            $query->whereRaw('LOWER(name_suffix) = ?', [strtolower($nameSuffix)]);
        }

        $existingProfile = $query->first();

        if ($existingProfile) {
            return response()->json([
                'is_unique' => false,
                'message' => 'An account with this full name combination already exists. If this is you, please use the login page instead.'
            ], 200);
        }

        return response()->json([
            'is_unique' => true,
            'message' => 'Name combination is available.'
        ], 200);
    }

    /**
     * Validate email uniqueness
     */
    public function validateEmailUniqueness(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = trim($request->email);

        // Check if a user with the same email already exists (case-insensitive)
        $existingUser = User::whereRaw('LOWER(email) = ?', [strtolower($email)])->first();

        if ($existingUser) {
            return response()->json([
                'is_unique' => false,
                'message' => 'An account with this email already exists.'
            ], 200);
        }

        return response()->json([
            'is_unique' => true,
            'message' => 'Email is available.'
        ], 200);
    }

    /**
     * Delete a user by ID (admin only)
     */
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Optional: Prevent deleting self
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }

    /**
     * Send password reset code to user's email
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check if a password reset was recently requested (prevent spam)
        if ($user->password_reset_code_expires_at && 
            $user->password_reset_code_expires_at->isFuture()) {
            return response()->json([
                'message' => 'A password reset code was already sent. Please check your email or wait before requesting another.',
                'code_expires_at' => $user->password_reset_code_expires_at->toISOString(),
                'time_remaining' => $user->password_reset_code_expires_at->diffForHumans(),
            ], 429);
        }

        // Generate 6-digit reset code
        $resetCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->update([
            'password_reset_code' => $resetCode,
            'password_reset_code_expires_at' => now()->addMinutes(15), // 15 minutes expiry
        ]);

        // Send password reset code email
        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($user, $resetCode));
            \Log::info('Password reset code email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reset_code' => $resetCode
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset code email:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            // Don't fail the request if email fails, just log it
        }

        return response()->json([
            'message' => 'Password reset code sent successfully. Please check your email.',
            'user_id' => $user->id,
            'email' => $user->email,
            'code_expires_at' => $user->password_reset_code_expires_at->toISOString(),
        ]);
    }

    /**
     * Verify password reset code
     */
    public function verifyPasswordResetCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'reset_code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if reset code is valid and not expired
        if (!$user->password_reset_code || 
            $user->password_reset_code !== $request->reset_code ||
            !$user->password_reset_code_expires_at ||
            $user->password_reset_code_expires_at->isPast()) {
            return response()->json([
                'message' => 'Invalid or expired reset code. Please request a new one.',
                'is_valid' => false,
            ], 400);
        }

        return response()->json([
            'message' => 'Reset code verified successfully.',
            'is_valid' => true,
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Reset password with verified code
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'reset_code' => 'required|string|size:6',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                function ($attribute, $value, $fail) {
                    if (!preg_match('/[A-Z]/', $value)) {
                        $fail('The password must contain at least one uppercase letter.');
                    }
                    if (!preg_match('/[a-z]/', $value)) {
                        $fail('The password must contain at least one lowercase letter.');
                    }
                    if (!preg_match('/[0-9]/', $value)) {
                        $fail('The password must contain at least one number.');
                    }
                    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $value)) {
                        $fail('The password must contain at least one special character.');
                    }
                },
            ],
            'password_confirmation' => 'required|string|min:8',
        ]);

        $user = User::findOrFail($request->user_id);

        // Verify reset code again
        if (!$user->password_reset_code || 
            $user->password_reset_code !== $request->reset_code ||
            !$user->password_reset_code_expires_at ||
            $user->password_reset_code_expires_at->isPast()) {
            return response()->json([
                'message' => 'Invalid or expired reset code. Please request a new one.',
            ], 400);
        }

        // Update password and clear reset code
        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_code' => null,
            'password_reset_code_expires_at' => null,
        ]);

        // Log password reset
        ActivityLogService::logAuth('password_reset', $request, $user);

        return response()->json([
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ]);
    }

    /**
     * Resend password reset code
     */
    public function resendPasswordResetCode(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if a reset code was recently sent (prevent spam)
        if ($user->password_reset_code_expires_at &&
            $user->password_reset_code_expires_at->isFuture()) {
            return response()->json([
                'message' => 'Please wait for your current reset code to expire before requesting a new one.',
                'code_expires_at' => $user->password_reset_code_expires_at->toISOString(),
                'time_remaining' => $user->password_reset_code_expires_at->diffForHumans(),
            ], 429);
        }

        // Generate new reset code
        $resetCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $user->update([
            'password_reset_code' => $resetCode,
            'password_reset_code_expires_at' => now()->addMinutes(15), // 15 minutes expiry
        ]);

        // Send new reset code email
        try {
            Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($user, $resetCode));
            \Log::info('Password reset code email resent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reset_code' => $resetCode
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to resend password reset code email:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            // Don't fail the request if email fails, just log it
        }

        return response()->json([
            'message' => 'New password reset code sent successfully. Please check your email.',
            'code_expires_at' => $user->password_reset_code_expires_at->toISOString(),
        ]);
    }

    /**
     * Clear existing password reset code (for starting over)
     */
    public function clearPasswordResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();
        
        // Log the clear action
        \Log::info('Password reset code cleared by user', [
            'user_id' => $user->id,
            'email' => $user->email,
            'had_reset_code' => !is_null($user->password_reset_code),
        ]);
        
        $user->update([
            'password_reset_code' => null,
            'password_reset_code_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Password reset code cleared successfully. You can now request a new one.',
            'cleared' => true,
        ]);
    }
}
