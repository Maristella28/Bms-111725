<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solo Parent Certification</title>
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
        .ft12 { font-size: 22px; font-family: Times; color: #0025cc; }
        .ft13 { font-size: 10px; font-family: Times; color: #000000; }
        .ft14 { font-size: 10px; font-family: Times; color: #000000; }
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
                $address = $resident->current_address ?? $resident->full_address ?? 'N/A';
            }
            
            // Convert address to uppercase (CAPSLOCK)
            $address = strtoupper($address);
            
            // Format date in CAPSLOCK
            $formattedDate = strtoupper(\Carbon\Carbon::now()->format('jS \d\a\y \of F Y'));
            
            // Get child information
            $childName = strtoupper($documentRequest->certification_data['child_name'] ?? $documentRequest->fields['childName'] ?? 'CHILD NAME');
            $childBirthDate = ($documentRequest->certification_data['child_birth_date'] ?? $documentRequest->fields['childBirthDate'])
                ? strtoupper(\Carbon\Carbon::parse($documentRequest->certification_data['child_birth_date'] ?? $documentRequest->fields['childBirthDate'])->format('F j, Y'))
                : 'BIRTH DATE';
            
            // Get purpose
            $purpose = strtoupper($documentRequest->fields['purpose'] ?? 'SOLO PARENT MEMBERSHIP | RENEWAL APPLICATION | REQUIREMENT');
        @endphp

        <img class="background-img" src="{{ public_path('assets/bgsolop.png') }}" alt="Solo Parent Certificate">
        <div class="text-layer">
            <p class="positioned-text ft10" style="top: 120px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
            <p class="positioned-text ft10" style="top: 136px; left: 349px;">PROVINCE OF LAGUNA</p>
            <p class="positioned-text ft10" style="top: 152px; left: 359px;">CABUYAO CITY</p>
            <p class="positioned-text ft11" style="top: 172px; left: 330px;">BARANGAY MAMATID</p>
            <p class="positioned-text ft11" style="top: 190px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
            <p class="positioned-text ft12" style="top: 250px; left: 187px;">C &nbsp;&nbsp; E &nbsp;&nbsp; R &nbsp;&nbsp; T &nbsp;&nbsp; I &nbsp;&nbsp; F &nbsp;&nbsp; I &nbsp;&nbsp; C &nbsp;&nbsp; A &nbsp;&nbsp; T &nbsp;&nbsp; I &nbsp;&nbsp; O &nbsp;&nbsp; N</p>
            <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
            
            <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF</p>
            <p class="positioned-text ft10" style="top: 368px; left: 110px;">OUR BARANGAYPARTICULARLY RESIDING AT <b>{{ $address }}</b>.</p>
            <p class="positioned-text ft10" style="top: 382px; left: 110px;">THAT HE/SHE IS LIVING IN THIS BARANGAY.</p>

            <p class="positioned-text ft10" style="top: 420px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED PERSON IS SOLO PARENT TO:</p>
            
            <p class="positioned-text ft13" style="top: 450px; left: 110px;"><b>1. {{ $childName }} — BORN ON {{ $childBirthDate }}</b></p>
            
            <p class="positioned-text ft10" style="top: 520px; left: 106px;">THIS CERTIFICATION IS ISSUED UPON THE REQUEST OF <b>{{ $residentName }}</b>, IS FOR</p>
            <p class="positioned-text ft13" style="top: 540px; left: 106px;"><b>{{ $purpose }}</b> PURPOSES.</p>
            
            <p class="positioned-text ft10" style="top: 580px; left: 106px;">GIVEN THIS <b>{{ $formattedDate }}</b> AT BARANGAY MAMATID, CITY OF CABUYAO, LAGUNA.</p>
            
            <p class="positioned-text ft10" style="top: 650px; left: 105px;">CERTIFIED CORRECT BY:</p>
            <p class="positioned-text ft13" style="top: 690px; left: 105px;"><b>HON. ERNANI G. HIMPISAO</b></p>
            <p class="positioned-text ft10" style="top: 716px; left: 106px;">PUNONG BARANGAY</p>
            <p class="positioned-text ft10" style="top: 732px; left: 106px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
            <p class="positioned-text ft14" style="top: 778px; left: 106px;"><i>*not valid without official seal</i></p>
        </div>
    </div>
</body>
</html>