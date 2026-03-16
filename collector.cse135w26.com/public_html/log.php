<?php
header('Content-Type: application/json');

/* =========================
   CORS CONFIGURATION
========================= */

// List all allowed origins (subdomains of your main domain)
$allowed_origins = [
    'https://collector.cse135w26.com',
    'https://test.cse135w26.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

/* Handle preflight OPTIONS requests */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* =========================
   VALIDATE REQUEST METHOD
========================= */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

/* =========================
   PARSE JSON INPUT
========================= */
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

/* =========================
   DATABASE CONNECTION
   ========================= */

require_once __DIR__ . '/../config/config.php';
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

/* =========================
   MAP DATA
========================= */
$session_id = $data['session'] ?? '';
$type       = $data['type'] ?? '';
$url        = $data['url'] ?? '';
$title      = $data['title'] ?? '';
$referrer   = $data['referrer'] ?? '';

$technographics = isset($data['technographics']) ? json_encode($data['technographics']) : null;
$performance    = isset($data['performance']) ? json_encode($data['performance']) : null;

$extra = json_encode(array_diff_key(
    $data,
    array_flip(['session','type','url','title','referrer','technographics','performance'])
));

$full_payload = json_encode($data);

/* =========================
   SECURE INSERT (PREPARED STATEMENT)
========================= */
$stmt = $mysqli->prepare("
    INSERT INTO collector_logs (
        session_id,
        type,
        url,
        title,
        referrer,
        technographics,
        performance,
        extra,
        full_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed', 'details' => $mysqli->error]);
    exit;
}

$stmt->bind_param(
    "sssssssss",
    $session_id,
    $type,
    $url,
    $title,
    $referrer,
    $technographics,
    $performance,
    $extra,
    $full_payload
);

if ($stmt->execute()) {
    echo json_encode(['status' => 'ok']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Insert failed', 'details' => $stmt->error]);
}

$stmt->close();
$mysqli->close();
