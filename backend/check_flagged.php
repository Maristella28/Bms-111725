<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking flagged residents...\n\n";

$residents = \App\Models\Resident::where('email', 'LIKE', '%@test.com')
    ->get(['resident_id', 'first_name', 'last_name', 'for_review', 'email']);

foreach($residents as $r) {
    $rawValue = $r->getAttributes()['for_review'];
    $flag = $r->for_review ? '✅ TRUE' : '❌ FALSE';
    echo "{$r->resident_id} - {$r->first_name} {$r->last_name} - for_review: {$flag} (raw: {$rawValue})\n";
}

echo "\nTotal test residents: " . $residents->count() . "\n";
echo "Flagged: " . $residents->where('for_review', true)->count() . "\n";

