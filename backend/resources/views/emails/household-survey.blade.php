<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Household Verification Survey - Barangay e-Governance</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
            font-weight: 700;
        }
        .survey-banner {
            background: #f0f4ff;
            border: 1px solid #818cf8;
            border-left: 4px solid #667eea;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }
        .survey-icon {
            width: 48px;
            height: 48px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: 700;
            font-size: 26px;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
            line-height: 1;
        }
        .survey-banner-content {
            flex: 1;
        }
        .survey-banner p {
            margin: 0;
            color: #4338ca;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.6;
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
            background: #667eea;
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
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            color: #6b7280;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
        }
        .info-value {
            color: #111827;
            font-weight: 700;
            font-size: 15px;
            text-align: right;
        }
        .survey-type-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 36px 32px;
            border-radius: 12px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
            position: relative;
        }
        .survey-type-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.95;
            margin-bottom: 14px;
            font-weight: 600;
        }
        .survey-type-value {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            background: rgba(255, 255, 255, 0.15);
            padding: 18px 32px;
            border-radius: 8px;
            display: inline-block;
            border: 2px solid rgba(255, 255, 255, 0.25);
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
        .info-box {
            background: #eff6ff;
            border: 1px solid #93c5fd;
            border-left: 4px solid #3b82f6;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .info-box strong {
            display: block;
            color: #1e40af;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .info-box p {
            margin: 0;
            color: #1e3a8a;
            font-size: 14px;
            line-height: 1.7;
            font-weight: 500;
        }
        .message-box {
            background: #f0f4ff;
            border: 1px solid #a5b4fc;
            border-left: 4px solid #667eea;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .message-box strong {
            display: block;
            color: #4338ca;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
        }
        .message-box p {
            margin: 0;
            color: #4338ca;
            font-size: 14px;
            line-height: 1.7;
            font-weight: 500;
        }
        .survey-list {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin: 28px 0;
            border: 1px solid #e5e7eb;
        }
        .survey-list ul {
            margin: 0;
            padding-left: 20px;
            color: #4b5563;
            font-size: 15px;
            line-height: 2;
        }
        .survey-list li {
            margin-bottom: 8px;
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
        .btn-container {
            text-align: center;
            margin: 36px 0;
        }
        .btn {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .survey-link {
            text-align: center;
            margin: 24px 0;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .survey-link p {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
        }
        .survey-link a {
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
            font-weight: 600;
        }
        .survey-link a:hover {
            text-decoration: underline;
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
            color: #667eea;
            font-weight: 700;
            font-size: 15px;
        }
        .footer {
            background: #1f2937;
            color: #d1d5db;
            padding: 36px 30px;
            text-align: center;
            border-top: 3px solid #667eea;
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
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
                padding: 12px 0;
            }
            .info-value {
                text-align: left;
                font-size: 14px;
            }
            .survey-type-value {
                font-size: 20px;
                padding: 14px 24px;
            }
            .btn {
                padding: 14px 32px;
                font-size: 15px;
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
            .survey-type-value {
                font-size: 18px;
                padding: 12px 20px;
            }
            .btn {
                padding: 12px 24px;
                font-size: 14px;
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
            .survey-type-value {
                font-size: 16px;
                padding: 10px 16px;
            }
            .btn {
                padding: 10px 20px;
                font-size: 13px;
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
                        <div style="width: 90px; height: 90px; border-radius: 50%; background: white; display: inline-block; text-align: center; line-height: 90px; border: 4px solid rgba(255,255,255,0.3); font-size: 28px; font-weight: 700; color: #667eea; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">BM</div>
                    @endif
                </div>
                <h1>Household Verification Survey</h1>
                <p class="header-subtitle">We Need Your Participation to Maintain Accurate Records</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Personalized Greeting -->
            <div class="greeting">
                Hello <strong>{{ $household->head_full_name ?? 'Resident' }}</strong>,
            </div>

            <!-- Survey Banner -->
            <div class="survey-banner">
                <div class="survey-icon">📋</div>
                <div class="survey-banner-content">
            <p>We hope this message finds you well. As part of our ongoing effort to maintain accurate and up-to-date household records, we kindly request your participation in this brief survey.</p>
                </div>
            </div>
            
            <!-- Household Information Card -->
            <div class="info-card">
                <div class="info-card-header">
                    <div class="info-card-icon">ℹ</div>
                    <h3>Household Information</h3>
                </div>
                <div class="info-row">
                    <span class="info-label">Household No</span>
                    <span class="info-value">{{ $household->household_no }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ $household->address ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Household Size</span>
                    <span class="info-value">{{ $household->members_count ?? 'N/A' }} members</span>
                </div>
            </div>
            
            <!-- Survey Type Section -->
            <div class="survey-type-section">
                <div class="survey-type-label">Survey Type</div>
                <div class="survey-type-value">{{ $survey->survey_type_label }}</div>
            </div>

            @if($survey->custom_message)
            <!-- Custom Message Box -->
            <div class="message-box">
                <strong>📝 Special Message</strong>
                <p>{{ $survey->custom_message }}</p>
            </div>
            @endif

            <!-- Survey Details -->
            <div class="survey-list">
                <p style="margin: 0 0 12px 0; color: #111827; font-weight: 700; font-size: 16px;">This survey will help us verify important information about your household, including:</p>
            <ul>
                <li>Current household members and their status</li>
                <li>Address and contact information</li>
                <li>Any recent changes (relocations, births, deaths, etc.)</li>
                <li>Benefit eligibility updates</li>
            </ul>
            </div>

            <!-- Expiration Warning -->
            <div class="warning-box">
                <div class="warning-header">
                    <div class="warning-icon">⏰</div>
                    <strong>Important Reminder</strong>
                </div>
                <p>This survey will expire on <strong>{{ $expiresAt }}</strong>. Please complete it at your earliest convenience to ensure your household records remain up-to-date.</p>
            </div>

            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Description -->
            <p class="description-text">
                Your participation is essential for maintaining accurate household records and ensuring that our barangay can provide you with the best possible services and support.
            </p>
            
            <!-- Call to Action Button -->
            <div class="btn-container">
                <a href="{{ $surveyUrl }}" class="btn">📝 Complete Survey Now</a>
            </div>
            
            <!-- Survey Link -->
            <div class="survey-link">
                <p>
                Or copy and paste this link into your browser:<br>
                    <a href="{{ $surveyUrl }}">{{ $surveyUrl }}</a>
            </p>
            </div>
            
            <!-- Privacy Notice -->
            <div class="info-box">
                <strong>🔒 Privacy Notice</strong>
                <p>Your responses will be kept confidential and used solely for maintaining accurate household records. All information is protected in accordance with data privacy regulations.</p>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
                <p>
                    <strong>Need Assistance?</strong><br>
                    If you have any questions or need assistance completing this survey, please contact our office directly. Our team is here to help you.
                </p>
            </div>
            
            <!-- Signature -->
            <div class="signature">
            <p>Thank you for your cooperation and for helping us maintain accurate records for our community.</p>
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
