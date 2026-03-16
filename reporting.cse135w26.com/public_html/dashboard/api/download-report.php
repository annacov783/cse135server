<?php
session_start();

if (!isset($_SESSION['role'])) {
    http_response_code(403);
    exit("Unauthorized");
}

$filename = basename($_GET['file']);
$path = __DIR__ . '/../reports/' . $filename;

if (!file_exists($path)) {
    http_response_code(404);
    exit("File not found");
}

header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $filename . '"');

readfile($path);
