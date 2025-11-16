<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>First Time Job Seeker Certification</title>
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
        .ft16 { font-size: 15px; font-family: Times; color: #0025cc; }
        .ft17 { font-size: 10px; font-family: Times; color: #7893de; }
        .ft20 { font-size: 10px; font-family: Times; color: #000000; }
        .ft21 { font-size: 11px; font-family: Times; color: #000000; }
        .ft22 { font-size: 19px; font-family: Times; color: #0025cc; }
        .ft23 { font-size: 10px; font-family: Times; color: #000000; }
        .ft24 { font-size: 10px; font-family: Times; color: #7893de; }
        .ft25 { font-size: 10px; line-height: 21px; font-family: Times; color: #000000; }
        .ft26 { font-size: 10px; line-height: 22px; font-family: Times; color: #000000; }
        
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
            
            // Get years in barangay
            $yearsInBarangay = $resident->years_in_barangay ?? 'six (6)';
            $yearsText = $resident->years_in_barangay == 1 ? 'YEAR' : 'YEARS';
            
            // Function to convert number to words
            function numberToWords($number) {
                $ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
                $tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                
                if ($number < 20) {
                    return $ones[$number];
                } elseif ($number < 100) {
                    return $tens[intval($number / 10)] . ($number % 10 ? '-' . $ones[$number % 10] : '');
                }
                return '';
            }
            
            // Format age as "TWENTY-THREE (23) YEARS OF AGE"
            $age = $resident->age ?? 23;
            $ageInWords = numberToWords($age);
            $ageFormatted = strtoupper($ageInWords . ' (' . $age . ') years of age');
        @endphp

        <img class="background-img" src="{{ public_path('assets/bgfjs1.png') }}" alt="First Time Job Seeker Certificate">
        <div class="text-layer">
            <p class="positioned-text ft10" style="top: 120px; left: 336px;">REPUBLIC OF THE PHILIPPINES</p>
            <p class="positioned-text ft10" style="top: 136px; left: 349px;">PROVINCE OF LAGUNA</p>
            <p class="positioned-text ft10" style="top: 152px; left: 359px;">CABUYAO CITY</p>
            <p class="positioned-text ft11" style="top: 172px; left: 330px;">BARANGAY MAMATID</p>
            <p class="positioned-text ft11" style="top: 190px; left: 280px;">OFFICE OF THE BARANGAY CHAIRMAN</p>
            <p class="positioned-text ft12" style="top: 290px; left: 240px;">BARANGAY CERTIFICATION</p>
            <p class="positioned-text ft16" style="top: 335px; left: 210px;">(FIRST TIME JOBSEEKERS ASSISTANCE ACT RA — 11261)</p>
            <p class="positioned-text ft17" style="top: 250px; left: 466px;">BARANGAY CERTIFICATE NUMBER: {{ 'S' . now()->format('y') }}-{{ str_pad($documentRequest->id, 5, '0', STR_PAD_LEFT) }}</p>
            
            <p class="positioned-text ft10" style="top: 378px; left: 110px;">THIS IS TO CERTIFY THAT MR./MS. <b>{{ $residentName }}</b>, IS A RESIDENT OF OUR BARANGAY PARTICULARLY</p>
            <p class="positioned-text ft10" style="top: 392px; left: 110px;">RESIDING AT {{ $address }}, CITY OF CABUYAO, LAGUNA</p>
            <p class="positioned-text ft10" style="top: 406px; left: 110px;">FOR {{ $yearsInBarangay }} {{ $yearsText }} AND IS A QUALIFIED AVAILEE OF <b>RA 11261</b> OR THE <i><b>FIRST TIME JOBSEEKERS ASSISTANCE ACT OF 2019.</b></i></p>
            
            <p class="positioned-text ft10" style="top: 450px; left: 110px;">I FURTHER CERTIFY THAT THE HOLDER/BEARER WAS INFORMED OF HIS/HER RIGHTS, INCLUDING THE DUTIES AND</p>
            <p class="positioned-text ft10" style="top: 464px; left: 110px;">RESPONSIBILITIES ACCORDED BY RA 11261 THROUGH THE <b>OATH OF UNDERTAKING</b> HE/SHE HAS SIGNED AND EXECUTED</p>
            <p class="positioned-text ft10" style="top: 478px; left: 110px;">IN THE PRESENCE OF BARANGAY OFFICIALS.</p>
            
            <p class="positioned-text ft10" style="top: 510px; left: 110px;">SIGNED THIS <b>{{ now()->format('jS') }}</b> DAY OF {{ now()->format('F Y') }} IN THE BARANGAY MAMATID, CITY OF CABUYAO, LAGUNA.</p>
            
            <p class="positioned-text ft10" style="top: 555px; left: 156px;">THIS CERTIFICATION IS VALID ONLY UNTIL {{ now()->addYear()->format('F j, Y') }} ONE (1) YEAR FROM ISSUANCE</p>
            
            <p class="positioned-text ft10" style="top: 640px; left: 105px;">CORRECT & CERTIFIED BY:</p>
            <p class="positioned-text ft13" style="top: 680px; left: 105px;"><b>HON. ERNANI G. HIMPISAO</b></p>
            <p class="positioned-text ft10" style="top: 710px; left: 106px;">PUNONG BARANGAY</p>
            <p class="positioned-text ft10" style="top: 726px; left: 106px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
            
            <p class="positioned-text ft10" style="top: 640px; left: 553px;">WITNESSED BY:</p>
            <p class="positioned-text ft13" style="top: 680px; left: 553px;"><b>RODNY C. PRAGOSO</b></p>
            <p class="positioned-text ft10" style="top: 710px; left: 553px;">BARANGAY OFFICE STAFF</p>
            <p class="positioned-text ft10" style="top: 726px; left: 553px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
            
            <p class="positioned-text ft15" style="top: 800px; left: 106px;"><i>*not valid without official seal</i></p>
        </div>
    </div>
    
    <!-- Page 2: Oath of Undertaking -->
    <div class="certificate-container" style="page-break-before: always;">
        <div class="certificate-number">
            Certificate No: {{ $documentRequest->id ?? 'N/A' }}
        </div>
        
        <img class="background-img" src="{{ public_path('assets/bgfjs2.png') }}" alt="Oath of Undertaking">
        <div class="text-layer">
 
            <p class="positioned-text ft24" style="top: 250px; left: 466px;">BARANGAY CERTIFICATE NUMBER: {{ 'S' . now()->format('y') }}-{{ str_pad($documentRequest->id, 5, '0', STR_PAD_LEFT) }}</p>
            <p class="positioned-text ft22" style="top: 280px; left: 295px;">OATH OF UNDERTAKING</p>
            
            <p class="positioned-text ft20" style="top: 352px; left: 110px;">I, <b>{{ $residentName }}</b>, {{ $ageFormatted }}, IS A RESIDENT OF OUR BARANGAY WITH POSTAL ADDRESS OF</p>
            <p class="positioned-text ft20" style="top: 364px; left: 110px;">{{ $address }}, CITY OF CABUYAO, LAGUNA. THAT SHE/HE IS</p>
            <p class="positioned-text ft20" style="top: 375px; left: 110px;">RESIDING IN THIS {{ $yearsInBarangay }} {{ $yearsText }} AND AVAILING THE BENEFITS OF <b>REPUBLIC ACT NO. 11261</b>, <br> OTHERWISE KNOWN AS <b>THE FIRST TIME JOBSEEKERS ASSISTANCE ACT OF 2019</b>,</p>
            <p class="positioned-text ft20" style="top: 406px; left: 110px;"> DO HEREBY DECLARE, AGREE AND UNDERTAKE TO ABIDE AND BE BOUND BY THE FOLLOWING:</p>

            <p class="positioned-text ft20" style="top: 436px; left: 119px;">1. THAT THIS IS THE FIRST TIME THAT I WILL ACTIVELY LOOK FOR A JOB, AND THEREFORE REQUESTING THAT A BARANGAY</p>
            <p class="positioned-text ft20" style="top: 452px; left: 130px;">CERTIFICATION BE ISSUED IN MY FAVOUR TO AVAIL THE BENEFITS OF THE LAW;</p>
            
            <p class="positioned-text ft20" style="top: 476px; left: 119px;">2. THAT I AM AWARE THAT THE BENEFIT AND PRIVILEGE/S UNDER THE SAID LAW SHALL BE VALID ONLY FOR ONE (1) YEAR</p>
            <p class="positioned-text ft20" style="top: 492px; left: 130px;">FROM THE DATE THAT THE BARANGAY CERTIFICATION IS ISSUED;</p>
            
            <p class="positioned-text ft25" style="top: 516px; left: 119px;">3. THAT I CAN AVAIL THE BENEFITS OF THE LAW ONLY ONCE;</p>

            <p class="positioned-text ft20" style="top: 556px; left: 119px;">4. THAT I UNDERSTAND THAT MY PERSONAL INFORMATION SHALL BE INCLUDED IN THE ROSTER LIST OF FIRST TIME</p>
            <p class="positioned-text ft20" style="top: 572px; left: 130px;">JOBSEEKERS AND WILL NOT BE USED FOR ANY UNLAWFUL PURPOSE;</p>
            
            <p class="positioned-text ft20" style="top: 596px; left: 119px;">5. THAT I WILL INFORM AND/OR REPORT TO THE BARANGAY PERSONALLY, THROUGH TEXT OR OTHER MEANS, OR</p>
            <p class="positioned-text ft20" style="top: 612px; left: 130px;">THROUGH MY FAMILY/RELATIVES ONCE I GET EMPLOYED;</p>
            
            <p class="positioned-text ft20" style="top: 636px; left: 119px;">6. THAT I AM NOT A BENEFICIARY OF THE JOB START PROGRAM UNDER R.A.NO.10869 AND OTHER LAWS THAT GIVE</p>
            <p class="positioned-text ft20" style="top: 652px; left: 130px;">SIMILAR EXEMPTIONS FOR THE DOCUMENTS OR TRANSACTIONS EXEMPTED UNDER R.A.NO.11261;</p>
            
            <p class="positioned-text ft20" style="top: 676px; left: 119px;">7. THAT IF ISSUED THE REQUESTED CERTIFICATION, I WILL NOT USE THE SAME IN ANY FRAUD, NEITHER FALSIFY NOR HELP</p>
            <p class="positioned-text ft20" style="top: 692px; left: 130px;">AND, OR ASSIST IN THE FABRICATION OF THE SAID CERTIFICATION;</p>
            
            <p class="positioned-text ft20" style="top: 716px; left: 119px;">8. THAT THIS UNDERTAKING IS MADE SOLELY FOR THE PURPOSE OF OBTAINING A BARANGAY CERTIFICATION CONSISTENT</p>
            <p class="positioned-text ft20" style="top: 732px; left: 130px;">WITH THE OBJECTIVE OF R.A.NO.11261 AND NOT FOR ANY OTHER PURPOSE;</p>
            
            <p class="positioned-text ft20" style="top: 756px; left: 119px;">9. THAT I CONSENT TO THE USE OF MY PERSONAL INFORMATION PURSUANT TO THE DATA PRIVACY ACT AND OTHER</p>
            <p class="positioned-text ft20" style="top: 772px; left: 130px;">APPLICABLE LAWS, RULES AND REGULATIONS.</p>
            
            <p class="positioned-text ft20" style="top: 796px; left: 110px;">SIGNED THIS <b>{{ now()->format('jS') }}</b> DAY OF {{ now()->format('F Y') }} IN THE BARANGAY MAMATID, CITY OF CABUYAO, LAGUNA.</p>
            
            <p class="positioned-text ft20" style="top: 856px; left: 110px;">SIGNED BY:</p>
            <p class="positioned-text ft20" style="top: 882px; left: 110px;">FIRST TIME JOBSEEKER</p>
            
            <p class="positioned-text ft20" style="top: 856px; left: 573px;">WITNESSED BY:</p>
            <p class="positioned-text ft26" style="top: 866px; left: 573px;"><b>RODNY C. PRAGOSO</b></p>
            <p class="positioned-text ft20" style="top: 902px; left: 573px;">BARANGAY OFFICE STAFF</p>
            <p class="positioned-text ft20" style="top: 918px; left: 573px;">MAMATID, CITY OF CABUYAO, LAGUNA</p>
        </div>
    </div> 
</body>
</html>