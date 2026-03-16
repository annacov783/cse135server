<?php

$uploadDir = __DIR__ . '/../reports/';

$filename = 'report_' . time() . '.pdf';
$path = $uploadDir . $filename;

move_uploaded_file($_FILES['file']['tmp_name'], $path);

echo json_encode([
    "url" => "/api/download-report.php?file=" . $filename
]);
