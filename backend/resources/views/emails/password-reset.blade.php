<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code - Barangay e-Governance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            background: #f5f7fa;
            background-attachment: fixed;
        }
        .email-wrapper {
            max-width: 680px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 48px 40px 40px;
            text-align: center;
            position: relative;
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo-container {
            margin-bottom: 24px;
        }
        .logo {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            background: white;
            padding: 4px;
            display: block;
            margin: 0 auto;
            object-fit: cover;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }
        .header-subtitle {
            margin: 0;
            font-size: 15px;
            opacity: 0.92;
            font-weight: 400;
            letter-spacing: 0.2px;
        }
        .content {
            padding: 48px 40px;
            background: #ffffff;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 28px;
            color: #111827;
            font-weight: 600;
            line-height: 1.6;
        }
        .greeting strong {
            color: #2563eb;
            font-weight: 700;
        }
        .security-banner {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-left: 4px solid #2563eb;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }
        .security-icon {
            width: 48px;
            height: 48px;
            background: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: 700;
            font-size: 26px;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
            line-height: 1;
        }
        .security-banner-content {
            flex: 1;
        }
        .security-banner p {
            margin: 0;
            color: #1e40af;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.6;
        }
        .code-section {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 40px 32px;
            border-radius: 12px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
            position: relative;
        }
        .code-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.95;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .reset-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 8px;
            font-family: 'Courier New', 'Monaco', monospace;
            background: rgba(255, 255, 255, 0.15);
            padding: 24px 40px;
            border-radius: 8px;
            display: inline-block;
            border: 2px solid rgba(255, 255, 255, 0.25);
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            line-height: 1.2;
        }
        .info-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 28px;
            margin: 28px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .info-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-card-icon {
            width: 40px;
            height: 40px;
            background: #2563eb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 22px;
            flex-shrink: 0;
            font-style: normal;
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1;
        }
        .info-card h3 {
            margin: 0;
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.2px;
        }
        .instructions-list {
            list-style: none;
            padding: 0;
            margin: 16px 0 0 0;
        }
        .instructions-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        .instructions-list li:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .instruction-number {
            width: 28px;
            height: 28px;
            background: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }
        .warning-box {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-left: 4px solid #f59e0b;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .warning-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .warning-icon {
            width: 40px;
            height: 40px;
            background: #f59e0b;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: 700;
            font-size: 22px;
            line-height: 1;
        }
        .warning-box strong {
            display: block;
            color: #92400e;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .warning-box p {
            margin: 0;
            color: #78350f;
            font-size: 14px;
            line-height: 1.7;
            font-weight: 500;
        }
        .security-box {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-left: 4px solid #ef4444;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .security-box strong {
            display: block;
            color: #991b1b;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .security-box p {
            margin: 0;
            color: #7f1d1d;
            font-size: 14px;
            line-height: 1.7;
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 36px 0;
            border: none;
        }
        .description-text {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.8;
            margin: 28px 0;
            text-align: center;
            padding: 0 10px;
        }
        .contact-info {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        .contact-info p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.7;
        }
        .contact-info strong {
            color: #374151;
            font-weight: 700;
        }
        .signature {
            margin-top: 32px;
            padding-top: 28px;
            border-top: 1px solid #e5e7eb;
        }
        .signature p {
            margin: 6px 0;
            color: #374151;
            font-size: 14px;
            line-height: 1.8;
        }
        .signature strong {
            color: #2563eb;
            font-weight: 700;
            font-size: 15px;
        }
        .footer {
            background: #1f2937;
            color: #d1d5db;
            padding: 36px 30px;
            text-align: center;
            border-top: 3px solid #2563eb;
        }
        .footer-logo-text {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 14px;
            letter-spacing: 0.3px;
        }
        .footer p {
            margin: 8px 0;
            color: #9ca3af;
            font-size: 13px;
            line-height: 1.7;
        }
        .footer strong {
            color: #ffffff;
            font-weight: 700;
        }
        .footer-divider {
            height: 1px;
            background: #374151;
            margin: 22px 0;
        }
        .footer-copyright {
            margin-top: 18px;
            padding-top: 18px;
            border-top: 1px solid #374151;
            color: #6b7280;
            font-size: 12px;
        }
        /* Tablet and below */
        @media only screen and (max-width: 768px) {
            .email-wrapper {
                max-width: 100%;
                margin: 0;
                border-radius: 0;
            }
            .header {
                padding: 40px 32px 36px;
            }
            .content {
                padding: 40px 32px;
            }
        }
        
        /* Mobile landscape and below */
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-wrapper {
                border-radius: 12px;
            }
            .header {
                padding: 36px 24px 32px;
            }
            .header h1 {
                font-size: 24px;
            }
            .header-subtitle {
                font-size: 14px;
            }
            .content {
                padding: 32px 24px;
            }
            .info-card {
                padding: 24px;
            }
            .reset-code {
                font-size: 32px;
                letter-spacing: 6px;
                padding: 20px 28px;
            }
            .btn {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            .logo {
                width: 70px;
                height: 70px;
            }
        }
        
        /* Small mobile devices */
        @media only screen and (max-width: 480px) {
            body {
                padding: 5px;
            }
            .email-wrapper {
                border-radius: 8px;
            }
            .header {
                padding: 28px 20px 24px;
            }
            .header h1 {
                font-size: 22px;
            }
            .header-subtitle {
                font-size: 13px;
            }
            .content {
                padding: 24px 20px;
            }
            .info-card {
                padding: 20px;
            }
            .reset-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 18px 24px;
            }
            .btn {
                padding: 12px 24px;
                font-size: 13px;
            }
            .logo {
                width: 60px;
                height: 60px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
            }
        }
        
        /* Very small mobile devices */
        @media only screen and (max-width: 320px) {
            body {
                padding: 0;
            }
            .email-wrapper {
                border-radius: 0;
            }
            .header {
                padding: 24px 16px 20px;
            }
            .header h1 {
                font-size: 20px;
            }
            .content {
                padding: 20px 16px;
            }
            .info-card {
                padding: 16px;
            }
            .reset-code {
                font-size: 24px;
                letter-spacing: 3px;
                padding: 16px 20px;
            }
            .btn {
                padding: 10px 20px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Enhanced Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo-container">
                    @php
                        $logoEmbedded = null;
                        $logoDataUri = null;
                        $appUrl = rtrim(config('app.url', 'http://localhost:8000'), '/');
                        
                        if (isset($message) && method_exists($message, 'embed')) {
                            $logoPaths = [
                                public_path('assets/logo.jpg'),
                                public_path('assets/images/logo.jpg'),
                            ];
                            
                            foreach ($logoPaths as $path) {
                                if (file_exists($path) && is_readable($path)) {
                                    try {
                                        $logoEmbedded = $message->embed($path);
                                        break;
                                    } catch (\Exception $e) {}
                                }
                            }
                        }
                        
                        if (!$logoEmbedded) {
                            $logoPaths = [
                                isset($logoPath) && $logoPath ? $logoPath : null,
                                public_path('assets/logo.jpg'),
                                public_path('assets/images/logo.jpg'),
                            ];
                            
                            foreach ($logoPaths as $path) {
                                if ($path && file_exists($path) && is_readable($path)) {
                                    try {
                                        $logoContent = file_get_contents($path);
                                        if ($logoContent && strlen($logoContent) > 100) {
                                            $logoBase64 = base64_encode($logoContent);
                                            $logoDataUri = 'data:image/jpeg;base64,' . $logoBase64;
                                            break;
                                        }
                                    } catch (\Exception $e) {}
                                }
                            }
                        }
                        
                        $logoUrl = null;
                        if (!$logoEmbedded && !$logoDataUri) {
                            $logoPaths = [
                                'assets/logo.jpg' => public_path('assets/logo.jpg'),
                                'assets/images/logo.jpg' => public_path('assets/images/logo.jpg'),
                            ];
                            
                            foreach ($logoPaths as $webPath => $filePath) {
                                if (file_exists($filePath)) {
                                    $logoUrl = $appUrl . '/' . $webPath;
                                    break;
                                }
                            }
                        }
                    @endphp
                    @if($logoEmbedded)
                        <img src="{{ $logoEmbedded }}" alt="Barangay Mamatid Logo" class="logo" width="90" height="90" border="0" style="width: 90px; height: 90px;">
                    @elseif($logoDataUri && strlen($logoDataUri) > 100)
                        <img src="{{ $logoDataUri }}" alt="Barangay Mamatid Logo" class="logo" width="90" height="90" border="0" style="width: 90px; height: 90px;">
                    @elseif($logoUrl)
                        <img src="{{ $logoUrl }}" alt="Barangay Mamatid Logo" class="logo" width="90" height="90" border="0" style="width: 90px; height: 90px;">
                    @else
                        <div style="width: 90px; height: 90px; border-radius: 50%; background: white; display: inline-block; text-align: center; line-height: 90px; border: 4px solid rgba(255,255,255,0.3); font-size: 28px; font-weight: 700; color: #2563eb; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">BM</div>
                    @endif
                </div>
            <h1>Password Reset Request</h1>
                <p class="header-subtitle">Secure Password Reset Code</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Personalized Greeting -->
            <div class="greeting">
                Hello <strong>{{ $user->name ?? 'User' }}</strong>,
            </div>

            <!-- Security Banner -->
            <div class="security-banner">
                <div class="security-icon">🔐</div>
                <div class="security-banner-content">
                    <p>We received a request to reset your password for your Barangay e-Governance account. Use the verification code below to complete the password reset process.</p>
                </div>
            </div>
            
            <!-- Reset Code Section -->
            <div class="code-section">
                <div class="code-label">Your Password Reset Code</div>
            <div class="reset-code">{{ $resetCode }}</div>
        </div>

            <!-- Instructions Card -->
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">📋</div>
                    <h3>Reset Instructions</h3>
                </div>
                <ol class="instructions-list">
                    <li>
                        <div class="instruction-number">1</div>
                        <div>Return to the password reset page on the Barangay e-Governance system</div>
                    </li>
                    <li>
                        <div class="instruction-number">2</div>
                        <div>Enter the 6-digit code shown above in the verification code field</div>
                    </li>
                    <li>
                        <div class="instruction-number">3</div>
                        <div>Create your new secure password following the password requirements</div>
                    </li>
                    <li>
                        <div class="instruction-number">4</div>
                        <div>Log in with your new password to access your account</div>
                    </li>
                </ol>
            </div>
            
            <!-- Security Warning -->
            <div class="warning-box">
                <div class="warning-header">
                    <div class="warning-icon">⏰</div>
                    <strong>Code Expiration</strong>
                </div>
                <p>This password reset code will expire in <strong>15 minutes</strong> for security reasons. Please use it promptly to reset your password.</p>
            </div>
            
            <!-- Security Notice -->
            <div class="security-box">
                <strong>🔒 Security Notice</strong>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged. If you continue to receive password reset emails that you didn't request, please contact our support team immediately.</p>
            </div>
            
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Description -->
            <p class="description-text">
                For your security, never share this code with anyone. Our team will never ask for your password reset code via phone or email.
            </p>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <p>
                    <strong>Need Assistance?</strong><br>
                    If you have any questions or concerns about this password reset request, please contact the barangay office. 
                    Our team is here to help you.
                </p>
            </div>
            
            <!-- Signature -->
            <div class="signature">
                <p>Best regards,</p>
                <p><strong>Barangay Administration Team</strong></p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">Barangay e-Governance System</p>
            </div>
        </div>

        <!-- Enhanced Footer -->
        <div class="footer">
            <div class="footer-logo-text">Barangay e-Governance</div>
            <p><strong>Automated Notification System</strong></p>
            <p>This is an automated email notification. Please do not reply to this message.</p>
            <div class="footer-divider"></div>
            <p>For inquiries or support, please visit your barangay office or contact us through the system.</p>
            <div class="footer-copyright">
                © {{ date('Y') }} Barangay e-Governance System. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
