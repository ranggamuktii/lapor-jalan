<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    \DB::table('reports')->insert([
        'category_id' => 1,
        'reporter_name' => 'Test',
        'reporter_phone' => '081',
        'title' => '',
        'description' => 'desc',
        'latitude' => '-6.406',
        'longitude' => '107.454',
        'photo_path' => 'path',
        'status' => 'pending',
    ]);
    echo "Insert successful\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
