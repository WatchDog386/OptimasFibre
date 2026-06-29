<?php
$file = __DIR__ . '/AS329741_Geofeed.csv';

if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . basename($file) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));

    readfile($file);
    exit;
}

http_response_code(404);
echo 'File not found.';