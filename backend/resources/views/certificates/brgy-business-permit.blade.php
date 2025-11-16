<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barangay Business Permit</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      background: #fff;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      position: relative;
    }

    #page1-div {
      position: relative;
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      background: #fff;
      overflow: hidden;
    }

    /* Background Image */
    #page1-div img {
      position: absolute;
      top: 0;
      left: 0;
      width: 210mm;
      height: 297mm;
      object-fit: cover;
    }

    /* Text styles */
    p { margin: 0; padding: 0; position: absolute; white-space: nowrap; }

    .ft10 { font-size: 10px; color: #000; }
    .ft11 { font-size: 11px; color: #000; }
    .ft12 { font-size: 17px; color: #0025cc; font-weight: bold; }
    .ft13 { font-size: 10px; color: #004aac; }
    .ft14 { font-size: 10px; line-height: 22px; color: #000; }
    .ft15 { font-size: 10px; line-height: 23px; color: #000; }

  
  </style>
</head>
<body>
  <div id="page1-div">
    <!-- Background -->
    <img src="{{ public_path('assets/bg.png') }}" class="bg" alt="background image">

    <!-- Header -->
    <p style="top:120px;left:336px;" class="ft10">REPUBLIC OF THE PHILIPPINES</p>
    <p style="top:130px;left:350px;" class="ft10">PROVINCE OF LAGUNA</p>
    <p style="top:155px;left:370px;" class="ft10">CABUYAO CITY</p>
    <p style="top:175px;left:320px;" class="ft11">BARANGAY MAMATID</p>
    <p style="top:1950px;left:355px;" class="ft13">0949-588-3131&nbsp;&nbsp;0906-579-1460</p>
    <p style="top:220px;left:290px;" class="ft12">BARANGAY BUSINESS PERMIT</p>

    <!-- Intro Text -->
    <p style="top:315px;left:110px;" class="ft15">
      TO WHOM IT MAY CONCERN:<br/>
      This is to certify that <strong>{{ $documentRequest->fields['businessOwner'] ?? ($resident->first_name . ' ' . $resident->last_name) }}</strong> 
      is hereby granted permission to operate the business known as <strong>{{ $documentRequest->fields['businessName'] ?? 'N/A' }}</strong> 
      within the jurisdiction of Barangay Mamatid.
    </p> </br>
    <p style="top:360px;left:110px;" class="ft15">
      This permit is issued in accordance with the barangay ordinances and regulations governing business operations within our jurisdiction.
    </p>
    </br>

    <!-- Labels -->
    <p style="top:390px;left:109px;" class="ft10">PERMIT NO.</p>
    <p style="top:405px;left:109px;" class="ft10">DATE ISSUED</p>
    <p style="top:450px;left:109px;" class="ft15">BUSINESS NAME</p>
    <p style="top:470px;left:109px;" class="ft15">BUSINESS OWNER</p>
    <p style="top:503px;left:109px;" class="ft10">BUSINESS ADDRESS</p>
    <p style="top:530px;left:109px;" class="ft10">CONTACT NUMBER</p>
    <p style="top:550px;left:109px;" class="ft10">EMAIL ADDRESS</p>
    <p style="top:595px;left:110px;" class="ft10">BUSINESS TYPE</p>
    <p style="top:615px;left:110px;" class="ft10">VALIDITY PERIOD</p>
    <p style="top:645px;left:110px;" class="ft14">PURPOSE</p>
    <p style="top:660px;left:110px;" class="ft14">REMARKS</p>
    

    <p style="top:755px;left:110px;" class="ft10">PLACE ISSUED</p>
    <p style="top:780px;left:110px;" class="ft10">DATE ISSUED</p>

    <!-- Dynamic Values -->
    <p style="top:390px;left:282px;" class="ft10">: {{ $documentRequest->id ?? 'N/A' }}</p>
    <p style="top:405px;left:282px;" class="ft10">: {{ \Carbon\Carbon::now()->format('M d, Y') }}</p>
    <p style="top:450px;left:282px;" class="ft14">
      : {{ $documentRequest->fields['businessName'] ?? 'N/A' }}<br/>
    </p>
    <p style="top:470px;left:282px;" class="ft14">: {{ $documentRequest->fields['businessOwner'] ?? ($resident->first_name . ' ' . $resident->last_name) }}</p>
    <p style="top:503px;left:282px;" class="ft10">: {{ $resident->current_address ?? 'N/A' }}</p>
    <p style="top:530px;left:282px;" class="ft10">: {{ $resident->mobile_number ?? 'N/A' }}</p>
    <p style="top:550px;left:282px;" class="ft10">: {{ $resident->email ?? 'N/A' }}</p>
    <p style="top:595px;left:282px;" class="ft10">: {{ $documentRequest->fields['businessType'] ?? 'N/A' }}</p>
    <p style="top:615px;left:282px;" class="ft10">: 1 year from date of issuance</p>
    <p style="top:645px;left:282px;" class="ft14">
      : {{ $documentRequest->fields['purpose'] ?? 'Business operations' }}<br/>
      : Valid business permit
    </p>

    <p style="top:755px;left:282px;" class="ft10">: Barangay Mamatid</p>
    <p style="top:780px;left:282px;" class="ft10">: {{ \Carbon\Carbon::now()->format('M d, Y') }}</p>


    <!-- Signatures -->
    <p style="top:865px;left:170px;" class="ft10">[TREASURER NAME]</p>
    <p style="top:865px;left:555px;" class="ft10">HON. ERNANI G. HIMPISAO</p>
    <p style="top:900px;left:170px;" class="ft10">Barangay Treasure</p>
    <p style="top:900px;left:555px;" class="ft10">PUNONG BARANGAY</p>
  </div>
</body>
</html> 
