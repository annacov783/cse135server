#!/usr/bin/php-cgi
<?php
header("Content-Type: application/json");
// $_SERVER contains CGI + request environment variables
$env = $_SERVER;
// Output as JSON
echo json_encode($env, JSON_PRETTY_PRINT);
?>

