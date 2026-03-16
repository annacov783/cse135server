#!/usr/bin/php-cgi
<?php
header("Content-Type: application/json");
// Date & time
$dateTime = date("Y-m-d H:i:s");
// Client IP address
$ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR']
    ?? $_SERVER['REMOTE_ADDR']
    ?? 'Unknown';
// Build response
$response = [
    "message" => "Hello World from PHP CGI",
    "date_time" => $dateTime,
    "ip_address" => $ipAddress
];
// Output JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?>

