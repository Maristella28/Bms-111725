<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barangay Notice - Case {{ $case_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .notice-title {
            font-size: 20px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 20px;
        }
        .case-info {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .appointment-details {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .important {
            background-color: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            color: #dc2626;
            font-weight: bold;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        /* Tablet and below */
        @media only screen and (max-width: 768px) {
            body {
                max-width: 100%;
                padding: 15px;
            }
            .container {
                padding: 25px 20px;
                border-radius: 8px;
            }
        }
        
        /* Mobile landscape and below */
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px 15px;
            }
            .header {
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .logo {
                font-size: 20px;
            }
            .notice-title {
                font-size: 18px;
            }
            .case-info,
            .appointment-details,
            .important {
                padding: 15px;
                margin: 15px 0;
            }
            .footer {
                font-size: 12px;
                padding-top: 15px;
                margin-top: 20px;
            }
        }
        
        /* Small mobile devices */
        @media only screen and (max-width: 480px) {
            body {
                padding: 5px;
            }
            .container {
                padding: 18px 12px;
            }
            .header {
                padding-bottom: 12px;
                margin-bottom: 15px;
            }
            .logo {
                font-size: 18px;
            }
            .notice-title {
                font-size: 16px;
                margin-bottom: 15px;
            }
            .case-info,
            .appointment-details,
            .important {
                padding: 12px;
                margin: 12px 0;
            }
            .case-info h3,
            .appointment-details h3,
            .important h3 {
                font-size: 14px;
            }
            .footer {
                font-size: 11px;
                padding-top: 12px;
                margin-top: 15px;
            }
        }
        
        /* Very small mobile devices */
        @media only screen and (max-width: 320px) {
            body {
                padding: 0;
            }
            .container {
                padding: 15px 10px;
                border-radius: 0;
            }
            .header {
                padding-bottom: 10px;
                margin-bottom: 12px;
            }
            .logo {
                font-size: 16px;
            }
            .notice-title {
                font-size: 14px;
                margin-bottom: 12px;
            }
            .case-info,
            .appointment-details,
            .important {
                padding: 10px;
                margin: 10px 0;
            }
            .footer {
                font-size: 10px;
                padding-top: 10px;
                margin-top: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BARANGAY HALL</div>
            <div style="color: #6b7280; font-size: 14px;">Official Notice</div>
        </div>

        <div class="notice-title">BARANGAY NOTICE</div>

        <p>Dear <strong>{{ $respondent_name }}</strong>,</p>

        <p>You are hereby notified to appear at the <span class="highlight">Barangay Hall</span> regarding a complaint filed against you.</p>

        <div class="case-info">
            <h3 style="color: #dc2626; margin-top: 0;">Case Information</h3>
            <p><strong>Case Number:</strong> {{ $case_number }}</p>
            <p><strong>Complaint Type:</strong> {{ $complaint_type }}</p>
            <p><strong>Complainant:</strong> {{ $complainant_name }}</p>
        </div>

        <div class="appointment-details">
            <h3 style="color: #1e40af; margin-top: 0;">📅 Required Appearance</h3>
            <p><strong>Date:</strong> <span class="highlight">{{ date('F j, Y', strtotime($appointment_date)) }}</span></p>
            <p><strong>Time:</strong> <span class="highlight">{{ $appointment_time }}</span></p>
            <p><strong>Location:</strong> {{ $barangay_hall_address }}</p>
        </div>

        @if($custom_message)
        <div class="important">
            <h3 style="color: #d97706; margin-top: 0;">📝 Additional Message</h3>
            <p>{{ $custom_message }}</p>
        </div>
        @endif

        <div class="important">
            <h3 style="color: #d97706; margin-top: 0;">⚠️ Important Instructions</h3>
            <ul>
                <li>Please bring a <strong>valid government-issued ID</strong></li>
                <li>Arrive <strong>15 minutes early</strong> for proper documentation</li>
                <li>Bring any <strong>relevant documents</strong> related to this case</li>
                <li>Failure to appear may result in further legal action</li>
            </ul>
        </div>

        <p>This notice is issued in accordance with the Barangay Justice System. Your cooperation is essential for the resolution of this matter.</p>

        <p>If you have any questions or concerns, please contact the Barangay Hall at <strong>{{ $contact_number }}</strong>.</p>

        <div class="footer">
            <p><strong>Barangay Hall</strong><br>
            {{ $barangay_hall_address }}<br>
            Contact: {{ $contact_number }}</p>
            <p style="font-size: 12px; color: #9ca3af;">
                This is an automated notice. Please do not reply to this email.<br>
                Generated on: {{ date('F j, Y \a\t g:i A') }}
            </p>
        </div>
    </div>
</body>
</html>
