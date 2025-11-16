<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Announcement - Barangay e-Governance</title>
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
            background: linear-gradient(135deg, {{ $headerColorStart }} 0%, {{ $headerColorEnd }} 100%);
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
            color: {{ $accentColor }};
            font-weight: 700;
        }
        .announcement-banner {
            border: 1px solid {{ $bannerBorderColor }};
            border-left: 4px solid {{ $bannerBorderColor }};
            padding: 20px 24px;
            border-radius: 12px;
            margin: 28px 0;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            background: {{ $bannerBgColor }};
        }
        .announcement-icon {
            width: 48px;
            height: 48px;
            background: {{ $bannerBorderColor }};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: 700;
            font-size: 26px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            line-height: 1;
        }
        .announcement-banner-content {
            flex: 1;
        }
        .announcement-banner p {
            margin: 0;
            color: {{ $bannerTextColor }};
            font-size: 16px;
            font-weight: 600;
            line-height: 1.6;
        }
        .announcement-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 28px;
            margin: 28px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .announcement-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
        }
        .announcement-card-icon {
            width: 40px;
            height: 40px;
            background: {{ $accentColor }};
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
        .announcement-card h3 {
            margin: 0;
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.2px;
        }
        .announcement-title {
            font-size: 22px;
            font-weight: 700;
            color: {{ $accentColor }};
            margin: 20px 0 16px 0;
            line-height: 1.4;
            letter-spacing: -0.3px;
        }
        .announcement-content {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.8;
            margin: 16px 0;
        }
        .announcement-content p {
            margin: 12px 0;
        }
        .announcement-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
        }
        .meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .meta-label {
            color: #6b7280;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-value {
            color: #111827;
            font-weight: 700;
            font-size: 14px;
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
            padding: 14px 32px;
            background: {{ $accentColor }};
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
            color: {{ $accentColor }};
            font-weight: 700;
            font-size: 15px;
        }
        .footer {
            background: #1f2937;
            color: #d1d5db;
            padding: 36px 30px;
            text-align: center;
            border-top: 3px solid {{ $accentColor }};
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
            .announcement-card {
                padding: 24px;
            }
            .announcement-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            .announcement-title {
                font-size: 20px;
            }
            .announcement-banner {
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 20px;
            }
            .announcement-icon {
                margin-bottom: 12px;
            }
            .btn {
                padding: 14px 28px;
                font-size: 14px;
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
            .announcement-card {
                padding: 20px;
            }
            .announcement-title {
                font-size: 18px;
            }
            .announcement-content {
                font-size: 14px;
            }
            .announcement-banner {
                padding: 16px;
            }
            .announcement-icon {
                width: 40px;
                height: 40px;
                font-size: 22px;
            }
            .announcement-card-icon {
                width: 36px;
                height: 36px;
                font-size: 20px;
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
            .announcement-card {
                padding: 16px;
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
                        <div style="width: 90px; height: 90px; border-radius: 50%; background: white; display: inline-block; text-align: center; line-height: 90px; border: 4px solid rgba(255,255,255,0.3); font-size: 28px; font-weight: 700; color: {{ $accentColor }}; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">BM</div>
                    @endif
                </div>
                <h1>{{ $headerTitle }}</h1>
                <p class="header-subtitle">{{ $headerSubtitle }}</p>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Personalized Greeting -->
            <div class="greeting">
                Hello <strong>{{ $user->name ?? 'Resident' }}</strong>,
            </div>
            
            <!-- Announcement Banner -->
            <div class="announcement-banner">
                <div class="announcement-icon">{{ $statusIcon }}</div>
                <div class="announcement-banner-content">
                    <p>{{ $statusMessage }}</p>
                </div>
            </div>
            
            <!-- Announcement Information Card -->
            <div class="announcement-card">
                <div class="announcement-card-header">
                    <div class="announcement-card-icon">📢</div>
                    <h3>Announcement Details</h3>
                </div>
                
                <div class="announcement-title">
                    {{ $announcement->title }}
                </div>
                
                <div class="announcement-content">
                    {!! $announcement->content !!}
                </div>
                
                <div class="announcement-meta">
                    <div class="meta-item">
                        <span class="meta-label">Posted Date</span>
                        <span class="meta-value">{{ \Carbon\Carbon::parse($announcement->created_at)->format('F d, Y') }}</span>
                    </div>
                    @if($announcement->created_at != $announcement->updated_at)
                    <div class="meta-item">
                        <span class="meta-label">Last Updated</span>
                        <span class="meta-value">{{ \Carbon\Carbon::parse($announcement->updated_at)->format('F d, Y') }}</span>
                    </div>
                    @endif
                </div>
            </div>
            
            <!-- Important Info Box -->
            <div class="info-box">
                <strong>📋 Stay Informed</strong>
                <p>This announcement has been posted by the Barangay Administration. Please review the details above and take any necessary action if required.</p>
            </div>
            
            <!-- Divider -->
            <div class="divider"></div>
            
            <!-- Description -->
            <p class="description-text">
                {{ $descriptionText }}
            </p>
            
            <!-- Call to Action Button -->
            <div class="btn-container">
                <a href="{{ $actionUrl }}" class="btn">View Full Announcement</a>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <p>
                    <strong>Need Assistance?</strong><br>
                    If you have any questions about this announcement, please don't hesitate to contact the barangay office. 
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

