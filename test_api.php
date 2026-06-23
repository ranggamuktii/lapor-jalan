<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$key = env('GEMINI_API_KEY');
if (!$key) {
    echo "NO KEY\n";
    exit;
}

$res = \Illuminate\Support\Facades\Http::get('https://generativelanguage.googleapis.com/v1beta/models?key=' . $key);

echo "Status: " . $res->status() . "\n";
echo "Body: " . $res->body() . "\n";
