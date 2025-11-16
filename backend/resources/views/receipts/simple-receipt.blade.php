<!DOCTYPE html>
<html>
<head>
    <title>Simple Receipt Test</title>
</head>
<body>
    <h1>Receipt Test</h1>
    <p>Receipt Number: {{ $receiptNumber }}</p>
    <p>Amount Paid: ₱{{ number_format($amountPaid, 2) }}</p>
    <p>Document Type: {{ $documentRequest->document_type ?? 'N/A' }}</p>
    <p>Resident: {{ $documentRequest->user->name ?? 'N/A' }}</p>
</body>
</html>
