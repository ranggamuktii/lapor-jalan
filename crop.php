<?php
$sourcePath = 'C:\\Users\\Rangga Mukti\\Downloads\\lapor-jalan.png';
$publicPath = __DIR__ . '/public';

function cropAndResize($source, $destination, $width, $height) {
    $src = imagecreatefrompng($source);
    
    // Auto-crop transparent edges
    $cropped = imagecropauto($src, IMG_CROP_DEFAULT);
    if ($cropped !== false) {
        imagedestroy($src);
        $src = $cropped;
    }
    
    // Create new image
    $dst = imagecreatetruecolor($width, $height);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
    imagefilledrectangle($dst, 0, 0, $width, $height, $transparent);
    
    $srcWidth = imagesx($src);
    $srcHeight = imagesy($src);
    
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $width, $height, $srcWidth, $srcHeight);
    
    // Save image
    imagepng($dst, $destination, 9);
    
    imagedestroy($src);
    imagedestroy($dst);
}

cropAndResize($sourcePath, $publicPath . '/logo-192.png', 192, 192);
cropAndResize($sourcePath, $publicPath . '/logo-512.png', 512, 512);
cropAndResize($sourcePath, $publicPath . '/favicon.png', 64, 64);
cropAndResize($sourcePath, $publicPath . '/app-logo.png', 256, 256);

echo "Images cropped and resized!\n";
