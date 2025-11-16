<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delayed Registration of Birth Certificate</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            background: #A0A0A0;
        }
        .certificate-container {
            position: relative;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
        }
        .background-img {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        .text-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            padding: 40px;
            box-sizing: border-box;
        }
        .ft9 { font-size: 14px; font-family: Times; color: #000000; }
        .ft10 { font-size: 11px; font-family: Times; color: #000000; }
        .ft11 { font-size: 12px; font-family: Times; color: #000000; }
        .ft12 { font-size: 24px; font-family: Times; color: #0025cc; }
        .ft13 { font-size: 10px; font-family: Times; color: #000000; }
        .ft14 { font-size: 11px; font-family: Times; color: #000000; }
        .ft15 { font-size: 10px; line-height: 23px; font-family: Times; color: #000000; }
        
        .positioned-text {
            position: absolute;
            white-space: nowrap;
        }
        
        .certificate-number {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 12px;
            color: #6c757d;
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 5px;
            z-index: 10;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-number">
            Certificate No: {{ $documentRequest->id ?? 'N/A' }}
        </div>
        
        @php
            $residentName = $documentRequest->fields['fullName'] ?? ($resident->first_name . ' ' . ($resident->middle_name ? $resident->middle_name . ' ' : '') . $resident->last_name . ($resident->name_suffix ? ' ' . $resident->name_suffix : ''));
            
            // Convert resident name to uppercase (CAPSLOCK)
            $residentName = strtoupper($residentName);
            
            // Build address from individual fields or fallback to current_address
            $houseNumber = $documentRequest->fields['houseNumber'] ?? '';
            $street = $documentRequest->fields['street'] ?? '';
            $purok = $documentRequest->fields['purok'] ?? '';
            $barangay = $documentRequest->fields['barangay'] ?? '';
            
            // If individual fields are available, construct address from them
            if ($houseNumber || $street || $purok || $barangay) {
                $address = trim(($houseNumber ? $houseNumber . ' ' : '') . 
                              ($street ? $street . ', ' : '') . 
                              ($purok ? $purok . ', ' : '') . 
                              ($barangay ? $barangay : ''));
                // Remove trailing comma and space if present
                $address = rtrim($address, ', ');
            } else {
                // Fallback to current_address from resident model
                $address = $resident->current_address ?? 'N/A';
            }
            
            // Convert address to uppercase (CAPSLOCK)
            $address = strtoupper($address);
            
            // Format date in CAPSLOCK
            $formattedDate = strtoupper(\Carbon\Carbon::now()->format('jS \d\a\y \of F Y'));
            
            // Get birth information
            $birthDate = $resident->birth_date ? strtoupper(\Carbon\Carbon::parse($resident->birth_date)->format('F d, Y')) : 'N/A';
            $birthPlace = strtoupper($documentRequest->fields['birthPlace'] ?? 'CITY OF BACOOR, CAVITE');
            
            // Get parent and requestor information from form inputs
            // Try certification_data first (for new requests), then fall back to fields (for old requests)
            $motherName = strtoupper($documentRequest->certification_data['mother_name'] ?? $documentRequest->fields['motherName'] ?? '');
            $fatherName = strtoupper($documentRequest->certification_data['father_name'] ?? $documentRequest->fields['fatherName'] ?? '');
            $requestorName = strtoupper($documentRequest->certification_data['requestor_name'] ?? $documentRequest->fields['requestorName'] ?? '');
            
            // Debug: Log the received fields for troubleshooting
            error_log('DEBUG - Document Request Fields: ' . json_encode($documentRequest->fields));
            error_log('DEBUG - Document Request Certification Data: ' . json_encode($documentRequest->certification_data));
            error_log('DEBUG - Mother Name: ' . $motherName);
            error_log('DEBUG - Father Name: ' . $fatherName);
            error_log('DEBUG - Requestor Name: ' . $requestorName);
            
            // Validate that required fields are not empty
            if (empty($motherName)) {
                $motherName = 'MOTHER\'S NAME NOT PROVIDED';
            }
            if (empty($fatherName)) {
                $fatherName = 'FATHER\'S NAME NOT PROVIDED';
            }
            if (empty($requestorName)) {
                $requestorName = 'REQUESTOR\'S NAME NOT PROVIDED';
            }
        @endphp

        <img class="background-img" src="{{ public_path('assets/bgdelayed.png') }}" alt="Delayed Registration Certificate">
        <div class="text-layer">
            <p class="positioned-text ft10" style="top: 120px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
            <p class="positioned-text ft10" style="top: 136px; left: 349px;">PROVINCE OF LAGUNA</p>
            <p class="positioned-text ft10" style="top: 152px; left: 359px;">CABUYAO CITY</p>
            <p class="positioned-text ft11" style="top: 172px; left: 330px;">BARANGAY MAMATID</p>
            <p class="positioned-text ft11" style="top: 190px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
            <p class="positioned-text ft12" style="top: 250px; left: 187px;">C &nbsp;&nbsp; E &nbsp;&nbsp; R &nbsp;&nbsp; T &nbsp;&nbsp; I &nbsp;&nbsp; F &nbsp;&nbsp; I &nbsp;&nbsp; C &nbsp;&nbsp; A &nbsp;&nbsp; T &nbsp;&nbsp; I &nbsp;&nbsp; O &nbsp;&nbsp; N</p>
            <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
            
            <p class="positioned-text ft10" style="top: 364px; left: 110px;">THIS IS TO CERTIFY THAT <b>{{ $residentName }}</b>, PRESENTLY</p>
            <p class="positioned-text ft10" style="top: 378px; left: 110px;"><b>{{ $address }}</b> WAS BORN ON <b>{{ $birthDate }}</b></p>
            <p class="positioned-text ft10" style="top: 392px; left: 110px;"> AT <b>{{ $birthPlace }}</b> PARENTS: <b>{{ $motherName }}</b> AND <b>{{ $fatherName }}</b>.</p>
            <p class="positioned-text ft10" style="top: 430px; left: 110px;">THIS CERTIFICATION IS BEING ISSUED UPON THE REQUEST <b>{{ $requestorName }}</b> FOR <b>DELAYED REGISTRATION OF</b></p>
            <p class="positioned-text ft13" style="top: 446px; left: 110px;"><b>BIRTH CERTIFICATE AT LOCAL CIVIL REGISTRY OFFICE,</b> CITY OF CABUYAO, LAGUNA. THAT THEIR FAMILY BELONGS TO</p>
            <p class="positioned-text ft10" style="top: 462px; left: 110px;">MANY <b>INDIGENT FAMILIES</b> IN OUR BARANGAY.</p>
            
            <p class="positioned-text ft10" style="top: 530px; left: 110px;">GIVEN THIS <b>{{ $formattedDate }}</b> AT BARANGAY MAMATID, CITY OF CABUYAO, LAGUNA.</p>
            
            <p class="positioned-text ft10" style="top: 580px; left: 105px;">CERTIFIED CORRECT BY:</p>
            <p class="positioned-text ft13" style="top: 620px; left: 105px;"><b>HON. ERNANI G. HIMPISAO</b></p>
            <p class="positioned-text ft10" style="top: 650px; left: 106px;">PUNONG BARANGAY</p>
            <p class="positioned-text ft10" style="top: 666px; left: 106px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
            <p class="positioned-text ft14" style="top: 712px; left: 106px;"><i>*not valid without official seal</i></p>
        </div>
    </div>
</body>
</html>