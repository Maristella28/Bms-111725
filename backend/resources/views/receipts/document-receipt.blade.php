<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Request Receipt</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 0;
      size: A4;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Open Sans', Arial, sans-serif;
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 50%, #a5d6a7 100%);
      height: 297mm;
      overflow: hidden;
    }
    .receipt-container {
      width: 210mm;
      height: 297mm;
      margin: 0;
      background: linear-gradient(145deg, #ffffff 0%, #f1f8e9 100%);
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .receipt-container::before,
    .receipt-container::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
    }
    .receipt-container::before {
      top: 0;
      height: 120px;
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%);
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 70%);
      opacity: 0.9;
    }
    .receipt-container::after {
      bottom: 0;
      height: 80px;
      background: linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #4caf50 100%);
      clip-path: polygon(0 30%, 100% 15%, 100% 100%, 0 100%);
      opacity: 0.9;
    }
    .corner-logo {
      position: absolute;
      top: 15px;
      width: 60px;
      height: 60px;
      object-fit: contain;
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border-radius: 50%;
      border: 2px solid #4caf50;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      z-index: 10;
    }
    .corner-logo:hover {
      transform: scale(1.05);
    }
    .left-corner-logo { left: 30px; }
    .right-corner-logo { right: 30px; }

    .header {
      padding: 25px 30px 0;
      text-align: center;
      position: relative;
      z-index: 11;
    }
    .republic {
      font-size: 14px;
      font-weight: 700;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.3px;
    }
    .province, .city {
      font-size: 12px;
      color: #4a5568;
      font-weight: 500;
      margin: 1px 0;
    }
    .barangay {
      font-size: 18px;
      font-weight: 700;
      color: #4caf50;
      font-family: 'Playfair Display', serif;
      margin: 5px 0;
    }
    .contact {
      font-size: 10px;
      color: #4caf50;
      font-weight: 500;
      margin-top: 3px;
    }

    .receipt-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 10px 0 5px;
      letter-spacing: 1px;
      text-align: center;
    }
    .green-line {
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #4caf50 20%, #2e7d32 50%, #4caf50 80%, transparent 100%);
      margin: 5px auto 10px;
      border-radius: 1px;
    }
    .content {
      padding: 0 30px;
      position: relative;
      z-index: 12;
    }
    .modern-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(76, 175, 80, 0.1);
    }
    .info-section {
      position: relative;
      width: 100%;
    }
    .info-fields {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .info-field {
      display: flex;
      align-items: center;
      font-size: 10px;
      margin-bottom: 4px;
      position: relative;
      padding: 1px 0;
    }
    .info-field:hover {
      background: rgba(76, 175, 80, 0.02);
      border-radius: 6px;
      padding: 4px 8px;
    }
    .field-label {
      font-weight: 600;
      width: 120px;
      color: #4a5568;
      font-family: 'Poppins', sans-serif;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .field-line {
      flex: 0 0 110px;
      border-bottom: 1px solid #e2e8f0;
      padding: 2px 4px;
      margin-left: 8px;
      font-weight: 500;
      color: #2d3748;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.03) 100%);
      border-radius: 2px 2px 0 0;
    }
    .field-line:hover {
      border-bottom-color: #4caf50;
      background: rgba(76, 175, 80, 0.05);
    }
    .document-info {
      margin: 15px 0;
      padding: 10px;
      background: rgba(76, 175, 80, 0.05);
      border-radius: 6px;
      border-left: 4px solid #4caf50;
    }
    .document-title {
      font-size: 12px;
      font-weight: 600;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 8px;
    }
    .document-details {
      font-size: 10px;
      color: #4a5568;
      line-height: 1.4;
    }
    .total-section {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid rgba(76, 175, 80, 0.2);
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    .total-label {
      font-weight: 600;
      color: #4a5568;
    }
    .total-amount {
      font-weight: 700;
      color: #2e7d32;
    }
    .footer-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-top: 1px solid rgba(76, 175, 80, 0.1);
    }
    .signature-area {
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    .signature-line {
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #4caf50 20%, #2e7d32 80%, transparent 100%);
      margin: 10px auto 4px;
      border-radius: 1px;
    }
    .signature-name {
      font-size: 11px;
      font-weight: 600;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
      margin-bottom: 2px;
    }
    .signature-title {
      font-size: 9px;
      color: #4caf50;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .notes {
      margin-top: 20px;
      padding: 10px;
      background: rgba(76, 175, 80, 0.05);
      border-radius: 6px;
      font-size: 9px;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- <img src="{{ public_path('assets/logo.jpg') }}" class="corner-logo left-corner-logo" alt="Logo">
    <img src="{{ public_path('assets/logo1.jpg') }}" class="corner-logo right-corner-logo" alt="Logo"> -->

    <div class="header">
      <div class="republic">REPUBLIC OF THE PHILIPPINES</div>
      <div class="province">PROVINCE OF LAGUNA</div>
      <div class="city">CABUYAO CITY</div>
      <div class="barangay">BARANGAY MAMATID</div>
      <div class="contact">0949-588-3131 0906-579-1460</div>
    </div>

    <div class="receipt-title">DOCUMENT REQUEST RECEIPT</div>
    <div class="green-line"></div>

    <div class="content">
      <div class="modern-card">
        <div style="margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #2d3748; font-family: 'Poppins', sans-serif;">RECEIPT DETAILS:</div>
        
        <div class="info-section">
          <div class="info-fields">
            @php 
            $resident = $documentRequest->resident ?? null;
            $user = $documentRequest->user ?? null;
            
            // Safely get contact number
            $contactNumber = 'N/A';
            if ($resident) {
                $contactNumber = $resident->contact_number ?? $resident->mobile_number ?? 'N/A';
            }
            
            // Safely get address
            $address = 'N/A';
            if ($resident) {
                $address = $resident->current_address ?? $resident->full_address ?? 'N/A';
            }
            
            // Safely get full name
            $fullName = 'N/A';
            if ($user && $user->name) {
                $fullName = $user->name;
            } elseif ($resident) {
                $fullName = trim(($resident->first_name ?? '') . ' ' . ($resident->last_name ?? ''));
                if (empty($fullName)) {
                    $fullName = 'N/A';
                }
            }
            
            // Safely get resident ID
            $residentId = 'N/A';
            if ($resident && isset($resident->resident_id)) {
                $residentId = $resident->resident_id;
            }
            
            $receiptFields = [
              ['RECEIPT NO.', $receiptNumber ?? 'N/A'],
              ['DATE ISSUED', \Carbon\Carbon::now()->format('M d, Y')],
              ['TIME ISSUED', \Carbon\Carbon::now()->format('h:i A')],
              ['RESIDENT NAME', $fullName],
              ['RESIDENT ID', $residentId],
              ['CONTACT NUMBER', $contactNumber],
              ['ADDRESS', $address],
            ]; 
            @endphp

            @foreach ($receiptFields as [$label, $value])
              <div class="info-field">
                <div class="field-label">{{ $label }}:</div>
                <div class="field-line">{{ $value }}</div>
              </div>
            @endforeach
          </div>
        </div>

        <div class="document-info">
          <div class="document-title">DOCUMENT INFORMATION:</div>
          <div class="document-details">
            <strong>Document Type:</strong> {{ $documentRequest->document_type ?? 'N/A' }}<br>
            @if($documentRequest->certification_type)
              <strong>Certification Type:</strong> {{ $documentRequest->certification_type }}<br>
            @endif
            <strong>Purpose:</strong> {{ isset($documentRequest->fields) && is_array($documentRequest->fields) && isset($documentRequest->fields['purpose']) ? $documentRequest->fields['purpose'] : 'N/A' }}<br>
            @if(isset($documentRequest->fields) && is_array($documentRequest->fields) && isset($documentRequest->fields['remarks']) && $documentRequest->fields['remarks'])
              <strong>Remarks:</strong> {{ $documentRequest->fields['remarks'] }}<br>
            @endif
            <strong>Request Date:</strong> {{ $documentRequest->created_at ? \Carbon\Carbon::parse($documentRequest->created_at)->format('M d, Y h:i A') : 'N/A' }}<br>
            <strong>Status:</strong> {{ $documentRequest->status ? ucfirst($documentRequest->status) : 'N/A' }}<br>
            @if($documentRequest->paidDocument)
              <strong>Payment Date:</strong> {{ $documentRequest->paidDocument->payment_date ? \Carbon\Carbon::parse($documentRequest->paidDocument->payment_date)->format('M d, Y h:i A') : 'N/A' }}<br>
              <strong>Payment Method:</strong> {{ ucfirst($documentRequest->paidDocument->payment_method ?? 'Cash') }}<br>
            @endif
          </div>
        </div>

        <div class="total-section">
          <div class="total-row">
            <div class="total-label">DOCUMENT FEE:</div>
            <div class="total-amount">₱{{ number_format($amountPaid ?? 0, 2) }}</div>
          </div>
          <div class="total-row">
            <div class="total-label">AMOUNT PAID:</div>
            <div class="total-amount">₱{{ number_format($amountPaid ?? 0, 2) }}</div>
          </div>
          <div class="total-row">
            <div class="total-label">PAYMENT STATUS:</div>
            <div class="total-amount">PAID</div>
          </div>
        </div>

        <div class="green-line"></div>

        <div class="footer-section">
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">RECEIVED BY</div>
          </div>
          <div class="signature-area">
            <div class="signature-line"></div>
            <div class="signature-name">{{ $fullName }}</div>
            <div class="signature-title">RESIDENT</div>
          </div>
        </div>

        <div class="notes">
          <p><strong>NOTE:</strong> This receipt is proof of payment for document request processing. Please keep this receipt for your records. The document will be processed according to the barangay's standard procedures.</p>
          <p style="margin-top: 5px; text-align: center; font-weight: 600;">Thank you for using our services!</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
