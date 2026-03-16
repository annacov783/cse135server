#!/usr/bin/php-cgi
<?php
header("Content-Type: application/json");
// Request metadata
$response = [
    "hostname"    => gethostname(),
    "timestamp"   => date("c"),
    "method"      => $_SERVER["REQUEST_METHOD"] ?? "UNKNOWN",
    "ip_address"  => $_SERVER["REMOTE_ADDR"] ?? "UNKNOWN",
    "user_agent"  => $_SERVER["HTTP_USER_AGENT"] ?? "UNKNOWN",
    "content_type"=> $_SERVER["CONTENT_TYPE"] ?? null,
];
// Capture query parameters (GET)
$response["query_params"] = $_GET;
// Capture body for POST / PUT / DELETE
$rawBody = file_get_contents("php://input");
$response["raw_body"] = $rawBody;
// Decode JSON if applicable
if (isset($_SERVER["CONTENT_TYPE"]) &&
    str_contains($_SERVER["CONTENT_TYPE"], "application/json")) {
    $decoded = json_decode($rawBody, true);
    $response["json_body"] = $decoded;
}
// Form-encoded body
$response["form_body"] = $_POST;
// Output response
echo json_encode($response, JSON_PRETTY_PRINT);
?>
