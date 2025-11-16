<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Indigency</title>
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
        .ft12 { font-size: 17px; font-family: Times; color: #0025cc; }
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
            $purpose = $documentRequest->fields['purpose'] ?? '';
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
        @endphp

        @if($purpose === 'Animal Bite Vaccination')
            <img class="background-img" src="{{ public_path('assets/bganimal.png') }}" alt="Animal Bite Vaccination Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 249px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">PARTICULARLY RESIDING AT {{ $address }}. THAT HE/ SHE IS </p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">RESIDING IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 424px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED PERSON IS ASKING FOR A MEDICAL / FINANCIAL ASSISTANCE</p>
                <p class="positioned-text ft10" style="top: 440px; left: 110px;">INTENDED FOR <b>ANIMAL BITE VACCINATION</b> THAT THEIR FAMILY BELONGS TO MANY INDIGENT FAMILIES IN OUR</p>
                <p class="positioned-text ft10" style="top: 456px; left: 110px;">BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 480px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF <b>{{ $residentName }}</b>, RESIDENT IS FOR <b>ANIMAL BITE VACCINATION</b></p>
                <p class="positioned-text ft10" style="top: 496px; left: 110px;">PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 535px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 620px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>

        @elseif($purpose === 'Burial/Financial Assistance')
            <img class="background-img" src="{{ public_path('assets/bgmedical.png') }}" alt="Burial/Financial Assistance Certificate"> 
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 250px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, WAS A RESIDENT OF OUR</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">BARANGAY PARTICULARLY RESIDED AT {{ $address }}.</p>
                <p class="positioned-text ft10" style="top: 414px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED NAME HAS PASSED AWAY LAST {{ strtoupper(\Carbon\Carbon::now()->format('F d, Y')) }}. THAT THEIR</p>
                <p class="positioned-text ft10" style="top: 430px; left: 110px;">FAMILY BELONGS TO MANY <b>INDIGENT FAMILIES</b> IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 470px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF {{ $residentName }}, FOR <b>BURIAL/FINANCIAL ASSISTANCE</b></p>
                <p class="positioned-text ft10" style="top: 486px; left: 110px;">PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 530px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 590px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 626px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 676px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 722px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>

        @elseif($purpose === 'BOTICAB Requirement')
            <img class="background-img" src="{{ public_path('assets/bghealthbotics.png') }}" alt="BOTICAB Certificate"> 
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 250px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">OUR BARANGAY PARTICULARLY RESIDING AT {{ $address }}. THAT HE/ SHE IS </p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">RESIDING IN THIS BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 424px; left: 110px;">THAT BASED ON MY KNOWLEDGE SHE/HE IS A LAW-ABIDING CITIZEN, OF GOOD MORAL CHARACTER, IS OF GOOD STANDING</p>
                <p class="positioned-text ft10" style="top: 440px; left: 110px;">AND HAS NO DEROGATORY RECORD IN OUR BARANGAY. THAT THEIR FAMILY BELONGS TO <b>MANY INDIGENT FAMILIES</b> IN</p>
                <p class="positioned-text ft10" style="top: 456px; left: 110px;">OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 480px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF {{ $residentName }}, IS <b>BOTICAB REQUIREMENT</b></p>
                <p class="positioned-text ft10" style="top: 496px; left: 110px;">PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 535px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CORRECT & CERTIFIED BY:</p>
                <p class="positioned-text ft15" style="top: 620px; left: 110px;"><b>HON. ERNANI G. HIMPISAO<br/>PUNONG BARANGAY</b></p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 106px;"><i>*not valid without official seal</i></p>
            </div>

            @elseif($purpose === 'Verification and identification (philhealth Requirements)')
            <img class="background-img" src="{{ public_path('assets/bghealthbotics.png') }}" alt="Verification and identification (philhealth Requirements) Certificate"> 
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 250px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">OUR BARANGAY PARTICULARLY RESIDING AT {{ $address }}. THAT HE/ SHE IS </p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">RESIDING IN THIS BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 424px; left: 110px;">THAT BASED ON MY KNOWLEDGE SHE/HE IS A LAW-ABIDING CITIZEN, OF GOOD MORAL CHARACTER, IS OF GOOD STANDING</p>
                <p class="positioned-text ft10" style="top: 440px; left: 110px;">AND HAS NO DEROGATORY RECORD IN OUR BARANGAY. THAT THEIR FAMILY BELONGS TO <b>MANY INDIGENT FAMILIES</b> IN</p>
                <p class="positioned-text ft10" style="top: 456px; left: 110px;">OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 480px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF {{ $residentName }}, </p>
                <p class="positioned-text ft10" style="top: 496px; left: 110px;">IS <b>VERIFICATION AND IDENTIFICATION (PHILHEALTH REQUIREMENTS)</b> PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 535px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 580px; left: 110px;">CORRECT & CERTIFIED BY:</p>
                <p class="positioned-text ft15" style="top: 620px; left: 110px;"><b>HON. ERNANI G. HIMPISAO<br/>PUNONG BARANGAY</b></p>
                <p class="positioned-text ft10" style="top: 660px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 710px; left: 106px;"><i>*not valid without official seal</i></p>
            </div>


        @elseif($purpose === 'Medical/Financial Assistance')
            <img class="background-img" src="{{ public_path('assets/bgmedical.png') }}" alt="Medical/Financial Assistance Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 249px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">PARTICULARLY AT {{ $address }}.</p>
                <p class="positioned-text ft10" style="top: 414px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED NAME IS ASKING FOR A MEDICAL/FINANCIAL ASSISTANCE. THAT THEIR FAMILY</p>
                <p class="positioned-text ft10" style="top: 430px; left: 110px;">BELONGS TO MANY <b>INDIGENT FAMILIES</b> IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 470px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF {{ $residentName }}, RESIDENT IS FOR</p>
                <p class="positioned-text ft10" style="top: 486px; left: 110px;">PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 530px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 690px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 626px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 676px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 722px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>

        @elseif($purpose === 'Public Attorney\'s Office Assistance')
            <img class="background-img" src="{{ public_path('assets/bgpao.png') }}" alt="PAO Assistance Certificate"> 
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 250px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, HIS/HER TRU NAME, OF LEGAL AGE,</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">IS A BONA FIDE RESIDENT OF OUR BARANGAY WITH POSTAL ADDRESS AT {{ $address }}.</p>
                <p class="positioned-text ft10" style="top: 384px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED PERSON HAS STAYED IN OUR BARANGAY FOR MANY YEARS. THAT THEIR FAMILY</p>
                <p class="positioned-text ft10" style="top: 402px; left: 110px;">IS ONE OF THE MANY <b>INDIGENT FAMILIES</b> IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 438px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON REQUEST OF {{ $residentName }}, FOR PUBLIC ATTORNEY'S OFFICE</p>
                <p class="positioned-text ft10" style="top: 454px; left: 110px;">ASSISTANCE PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 498px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 558px; left: 105px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 594px; left: 105px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <p class="positioned-text ft10" style="top: 618px; left: 106px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 644px; left: 106px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 722px; left: 106px;"><i>*not valid without official seal</i></p>
            </div>

        @else
            <!-- Default template for other purposes -->
            <img class="background-img" src="{{ public_path('assets/bgmedical.png') }}" alt="Default Certificate">
            <div class="text-layer">
                <p class="positioned-text ft11" style="top: 162px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
                <p class="positioned-text ft11" style="top: 178px; left: 349px;">PROVINCE OF LAGUNA</p>
                <p class="positioned-text ft11" style="top: 194px; left: 379px;">CABUYAO CITY</p>
                <p class="positioned-text ft9" style="top: 213px; left: 330px;">BARANGAY MAMATID</p>
                <p class="positioned-text ft9=" style="top: 231px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
                <p class="positioned-text ft12" style="top: 350px; left: 297px;">CERTIFICATE OF INDIGENCY</p>
                <p class="positioned-text ft10" style="top: 320px; left: 110px;">TO WHOM IT MAY CONCERN:</p>
                <p class="positioned-text ft10" style="top: 354px; left: 110px;">THIS IS TO CERTIFY THAT AS PER RECORD KEPT IN THIS OFFICE THAT <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY</p>
                <p class="positioned-text ft10" style="top: 368px; left: 110px;">PARTICULARLY AT {{ $address }}.</p>
                <p class="positioned-text ft10" style="top: 414px; left: 110px;">THIS FURTHER CERTIFIES THAT THE ABOVE-MENTIONED NAME IS ASKING FOR FINANCIAL ASSISTANCE. THAT THEIR FAMILY</p>
                <p class="positioned-text ft10" style="top: 430px; left: 110px;">BELONGS TO MANY <b>INDIGENT FAMILIES</b> IN OUR BARANGAY.</p>
                <p class="positioned-text ft10" style="top: 470px; left: 110px;">THIS CERTIFICATION IS ISSUED UPON THE REQUEST OF {{ $residentName }}, IS FOR FINANCIAL ASSISTANCE</p>
                <p class="positioned-text ft10" style="top: 486px; left: 110px;">PURPOSES ONLY.</p>
                <p class="positioned-text ft10" style="top: 530px; left: 110px;">GIVE THIS DAY OF {{ $formattedDate }} AT BARANGAY MAMATID, CITY OF CABUAYO, LAGUNA.</p>
                <p class="positioned-text ft10" style="top: 590px; left: 110px;">CERTIFIED CORRECT BY:</p>
                <p class="positioned-text ft13" style="top: 626px; left: 109px;"><b>HON. ERNANI G. HIMPISAO</b></p>
                <p class="positioned-text ft10" style="top: 650px; left: 110px;">PUNONG BARANGAY</p>
                <p class="positioned-text ft10" style="top: 676px; left: 110px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
                <p class="positioned-text ft14" style="top: 722px; left: 110px;"><i>*not valid without official seal</i></p>
            </div>
        @endif
    </div>
</body>
</html> 