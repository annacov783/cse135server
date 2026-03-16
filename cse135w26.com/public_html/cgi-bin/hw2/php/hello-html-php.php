#!/usr/bin/php
<?php
header("Content-Type: text/html");
// Get date & time
$dateTime = date("Y-m-d H:i:s");
// Get user IP address
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
echo "<!DOCTYPE html>";
echo "<html><head><title>PHP CGI Info</title></head><body>";
echo "<h1>Hello World</h1>";
echo "<p>This page was generated with PHP programming language.</p>";
echo "<p><strong>This page was generated at:</strong> $dateTime</p>";
echo "<p><strong>Your IP Address:</strong> $ipAddress</p>";
echo "</body></html>";
?>

