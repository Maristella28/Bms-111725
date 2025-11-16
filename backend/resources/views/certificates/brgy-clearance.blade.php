<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barangay Clearance Certificate</title>
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

    /* Photo and thumbmark containers */
    .photo-container, .thumb-container {
      position: absolute;
      border: 1px solid #ccc;
      background: #fff;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      font-size: 9px;
      font-weight: 600;
      color: #000;
      text-transform: uppercase;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .photo-container {
      top: 392px;
      left: 645px;
      width: 120px;
      height: 102px;
      padding-bottom: 8px;
    }

    .thumb-container {
      top: 525px;
      left: 645px;
      width: 120px;
      height: 102px;
      padding-bottom: 8px;
    }
  </style>
</head>

<body>
  <div id="page1-div">
    <!-- Background -->
	<img src="{{ public_path('assets/bgclearance.png') }}" class="bg" alt="background image">

    <!-- Header -->
    <p style="top:120px;left:336px;" class="ft10">REPUBLIC OF THE PHILIPPINES</p>
    <p style="top:136px;left:350px;" class="ft10">PROVINCE OF LAGUNA</p>
    <p style="top:152px;left:370px;" class="ft10">CABUYAO CITY</p>
    <p style="top:125px;left:355px;" class="ft11">BARANGAY MAMATID</p>
    <p style="top:170px;left:365px;" class="ft13">0949-588-3131&nbsp;&nbsp;0906-579-1460</p>
    <p style="top:200px;left:324px;" class="ft12">BARANGAY CLEARANCE</p>

    <!-- Intro Text -->
    <p style="top:315px;left:110px;" class="ft15">
      TO WHOM IT MAY CONCERN:<br/>
      As per record kept in this office, the person whose name, right thumbmark and signature appear hereon has requested a 
    </p>
	<p style="top:360px;left:110px;" class="ft15">
      BARANGAY CLEARANCE with the following information.
    </p>
    <!-- Labels -->
    <p style="top:390px;left:109px;" class="ft10">CLEARANCE NO.</p>  </br>
    <p style="top:405px;left:109px;" class="ft10">DATE ISSUED</p>
    <p style="top:450px;left:109px;" class="ft15">NAME</p> </br>
	<p style="top:470px;left:109px;" class="ft15">ADDRESS</p> </br>
    <p style="top:503px;left:109px;" class="ft10">PERIOD OF STAY</p>
    <p style="top:530px;left:109px;" class="ft10">CIVIL STATUS</p>
    <p style="top:550px;left:109px;" class="ft10">DATE OF BIRTH</p>
    <p style="top:570px;left:109px;" class="ft10">BIRTH PLACE</p>
    <p style="top:595px;left:110px;" class="ft10">SEX</p>
    <p style="top:615px;left:110px;" class="ft10">AGE</p>
    <p style="top:645px;left:110px;" class="ft14">PURPOSE</p>
	<p style="top:660px;left:110px;" class="ft14">REMARKS</p>
  
    
    <p style="top:735px;left:110px;" class="ft10">CTC NO.</p></br>
    <p style="top:755px;left:110px;" class="ft10">PLACE ISSUED</p></br>
    <p style="top:780px;left:110px;" class="ft10">DATE ISSUED</p>

    <!-- Dynamic Values -->
    <p style="top:390px;left:282px;" class="ft10">: {{ $documentRequest->id ?? 'N/A' }}</p>
    <p style="top:405px;left:282px;" class="ft10">: {{ \Carbon\Carbon::now()->format('M d, Y') }}</p>
    <p style="top:450px;left:282px;" class="ft14">
      : {{ "{$resident->first_name} {$resident->middle_name} {$resident->last_name}" . ($resident->name_suffix ? " {$resident->name_suffix}" : '') }}<br/>
    <p style="top:470px;left:282px;" class="ft14">: {{ $resident->current_address ?? 'N/A' }}
    </p>
    <p style="top:503px;left:282px;" class="ft10">: {{ $resident->years_in_barangay ? $resident->years_in_barangay . ' years' : 'N/A' }}</p>
    <p style="top:530px;left:282px;" class="ft10">: {{ $resident->civil_status ?? 'N/A' }}</p>
    <p style="top:550px;left:282px;" class="ft10">: {{ $resident->birth_date ? \Carbon\Carbon::parse($resident->birth_date)->format('M d, Y') : 'N/A' }}</p>
    <p style="top:570px;left:282px;" class="ft10">: {{ $resident->birth_place ?? 'N/A' }}</p>
    <p style="top:595px;left:282px;" class="ft10">: {{ $resident->sex ?? 'N/A' }}</p>
    <p style="top:615px;left:282px;" class="ft10">: {{ isset($resident->age) ? $resident->age . ' years old' : 'N/A' }}</p>
    <p style="top:645px;left:282px;" class="ft14">
      : {{ $documentRequest->fields['purpose'] ?? 'Official purposes' }}<br/>
      : No pending case
    </p>
    <p style="top:735px;left:282px;" class="ft10">: N/A</p>
    <p style="top:755px;left:282px;" class="ft10">: Barangay Mamatid</p>
    <p style="top:780px;left:282px;" class="ft10">: {{ \Carbon\Carbon::now()->format('M d, Y') }}</p>

    <!-- Resident Photo -->
    <div class="photo-container">
      @php
        $photoFound = false;
        $photoData = null;
        
        // First try to get photo from document request (uploaded during request)
        if(isset($documentRequest->photo_path) && $documentRequest->photo_path) {
          if (str_starts_with($documentRequest->photo_path, 'http')) {
            // Handle external URLs
            $photoData = $documentRequest->photo_path;
            $photoFound = true;
          } elseif (file_exists(storage_path('app/public/' . $documentRequest->photo_path))) {
            // Convert to base64 for DomPDF compatibility
            $filePath = storage_path('app/public/' . $documentRequest->photo_path);
            $fileContents = file_get_contents($filePath);
            $mimeType = mime_content_type($filePath);
            $photoData = 'data:' . $mimeType . ';base64,' . base64_encode($fileContents);
            $photoFound = true;
          }
        }
        
        // Fallback to resident profile photo if no document request photo
        if (!$photoFound && isset($resident->current_photo) && $resident->current_photo) {
          if (file_exists(storage_path('app/public/' . $resident->current_photo))) {
            // Convert to base64 for DomPDF compatibility
            $filePath = storage_path('app/public/' . $resident->current_photo);
            $fileContents = file_get_contents($filePath);
            $mimeType = mime_content_type($filePath);
            $photoData = 'data:' . $mimeType . ';base64,' . base64_encode($fileContents);
            $photoFound = true;
          }
        }
      @endphp

      @if($photoFound && $photoData)
        <img src="{{ $photoData }}" alt="Resident Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 7px;">
      @else
        PHOTO
      @endif
    </div>

    <!-- Thumbmark -->
    <div class="thumb-container">
      THUMBMARK
    </div>

    <!-- Signatures -->
    <p style="top:840px;left:110px;" class="ft10">ISSUED TO:</p>
    <p style="top:840px;left:480px;" class="ft10">APPROVED FOR ISSUE:</p>
    <p style="top:865px;left:555px;" class="ft10">HON. ERNANI G. HIMPISAO</p>
    <p style="top:900px;left:259px;" class="ft10">SIGNATURE</p>
    <p style="top:900px;left:555px;" class="ft10">PUNONG BARANGAY</p>
  </div>
</body>
</html>
