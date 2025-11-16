<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Residency</title>
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
        .signature-line {
            position: absolute;
            top: 610px;
            left: 20px;
            width: 200px;
            height: 1px;
            background: #000000;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-number">
            Certificate No: {{ $documentRequest->id ?? 'N/A' }}
        </div>
        
        @php
            $purpose = strtolower($documentRequest->fields['purpose'] ?? '');
            $residentName = $documentRequest->fields['fullName'] ?? ($resident->first_name . ' ' . $resident->last_name);
            
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
            $formattedDate = strtoupper(\Carbon\Carbon::now()->format('jS \d\a\y \of F, Y'));
            
            // Get years in barangay
            $yearsInBarangay = $resident->years_in_barangay ?? 'N/A';
        @endphp

        @if(str_contains($purpose, 'verification and identification pwd'))
            <img class="background-img" src="{{ public_path('assets/bgresidencypwd.png') }}" alt="PWD Residency Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 220px; left: 297px;">CERTIFICATE OF RESIDENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR </p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">BARANGAY PARTICULARLY RESIDING AT {{ $address }}. THAT HE/ SHE IS</p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">RESIDING IN THISBARANGAY FOR {{ $yearsInBarangay }} YEARS.</p>
                <p class="positioned-text ft10" style="top: 424px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED NAME IS PERSON WITH DISABILITY. THAT THEIR FAMILY BELONGS</p>
                <p class="positioned-text ft10" style="top: 440px; left: 110px;">TO MANY INDIGENT FAMILIES IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 480px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF <b>{{ $residentName }}</b>, FOR <b>VERIFICATION AND</b></p>
                <p class="positioned-text ft10" style="top: 496px; left: 110px;"><b>IDENTIFICATION PWD</b> PURPOSE ONLY.</p>
                <p class="positioned-text ft10" style="top: 535px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 620px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <div class="signature-line"></div>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>

        @elseif(str_contains($purpose, 'verification and identification'))
            <img class="background-img" src="{{ public_path('assets/bgresidency.png') }}" alt="School Requirement Residency Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 220px; left: 297px;">CERTIFICATE OF RESIDENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">BARANGAY PARTICULARLY AT {{ $address }}. THAT HE/ SHE IS </p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">RESIDING IN THIS BARANGAY FOR{{ $yearsInBarangay }} YEARS.</p>
                <p class="positioned-text ft10" style="top: 424px; left: 110px;">THAT AS OF MY KNOWLEDGE SHE/HE HAS NO DEROGATORY RECORD ON FILE OR ANY PENDING CASE AS THIS DATE</p>
                <p class="positioned-text ft10" style="top: 440px; left: 110px;"> AND HAS BEEN KNOWN TO ME OF GOOD MORAL CHARACTER AND A LAW-ABIDING CITIZEN IN OUR BARANGAY;</p>
                <p class="positioned-text ft10" style="top: 480px; left: 110px;">THIS IS ISSUED UPON REQUEST OF <b>{{ $residentName }}</b>, FOR <b>VERIFICATION AND IDENTIFICATION</b></p>
                <p class="positioned-text ft10" style="top: 496px; left: 110px;"><b>(SCHOOL REQUIREMENT)</b> PURPOSE ONLY.</p>
                <p class="positioned-text ft10" style="top: 535px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 620px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <div class="signature-line"></div>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>

        @else
            <!-- Default template for other purposes -->
            <img class="background-img" src="{{ public_path('assets/bgresidency.png') }}" alt="Default Residency Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 220px; left: 297px;">CERTIFICATE OF RESIDENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT <b>{{ $residentName }}</b>, OF LEGAL AGE, {{ strtoupper($resident->civil_status ?? '') }}, {{ strtoupper($resident->nationality ?? 'FILIPINO') }},</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">IS A BONAFIDE RESIDENT OF {{ $address }} WITHIN THE JURISDICTION OF BARANGAY MAMATID.</p>
                <p class="positioned-text ft10" style="top: 414px; left: 110px;">THIS CERTIFICATION IS BEING ISSUED UPON THE REQUEST OF THE ABOVE-NAMED PERSON FOR <b>{{ strtoupper($documentRequest->fields['purpose'] ?? 'OFFICIAL PURPOSES') }}</b>.</p>
                <p class="positioned-text ft10" style="top: 450px; left: 110px;">THIS CERTIFICATION IS VALID FOR 6 MONTHS FROM THE DATE OF ISSUANCE AND MAY BE USED FOR VARIOUS</p>
                <p class="positioned-text ft10" style="top: 466px; left: 110px;">GOVERNMENT AND PRIVATE TRANSACTIONS REQUIRING PROOF OF RESIDENCY.</p>
                <p class="positioned-text ft10" style="top: 510px; left: 110px;">ISSUED THIS {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUYAO, LAGUNA, PHILIPPINES.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 620px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <div class="signature-line"></div>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>
        @endif
    </div>
</body>
</html>