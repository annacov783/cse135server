<?php


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    
    require_once __DIR__ . '/../config/config.php';
    
    //Connect to database 
   //$pdo = new PDO(
   //     "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
   //     $DB_USER,
   //     $DB_PASS,
   //     [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
   // );

   $pdo = new PDO(
       "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
       DB_USER,
       DB_PASS,
       [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
   );


    //routing
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $parts = explode('/', trim($uri, '/'));

    $resource = $parts[1] ?? '';
    $id = isset($parts[2]) ? (int)$parts[2] : null;

    if ($resource !== 'items') {
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    
    if ($method === 'GET') {

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM collector_logs WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Item not found']);
                exit;
            }

            echo json_encode($row);

        } else {
            $stmt = $pdo->query("SELECT * FROM collector_logs ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    }

    
    if ($method === 'POST') {

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || empty($data['session_id']) || empty($data['type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'session_id and type required']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO collector_logs 
            (session_id, type, url, title, referrer, technographics, performance, extra, full_payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['session_id'],
            $data['type'],
            $data['url'] ?? null,
            $data['title'] ?? null,
            $data['referrer'] ?? null,
            isset($data['technographics']) ? json_encode($data['technographics']) : null,
            isset($data['performance']) ? json_encode($data['performance']) : null,
            isset($data['extra']) ? json_encode($data['extra']) : null,
            isset($data['full_payload']) ? json_encode($data['full_payload']) : null
        ]);

        $newId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("SELECT * FROM collector_logs WHERE id = ?");
        $stmt->execute([$newId]);

        http_response_code(201);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    }

    
    if ($method === 'PUT') {

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM collector_logs WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE collector_logs SET
                session_id = ?,
                type = ?,
                url = ?,
                title = ?,
                referrer = ?,
                technographics = ?,
                performance = ?,
                extra = ?,
                full_payload = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $data['session_id'],
            $data['type'],
            $data['url'] ?? null,
            $data['title'] ?? null,
            $data['referrer'] ?? null,
            isset($data['technographics']) ? json_encode($data['technographics']) : null,
            isset($data['performance']) ? json_encode($data['performance']) : null,
            isset($data['extra']) ? json_encode($data['extra']) : null,
            isset($data['full_payload']) ? json_encode($data['full_payload']) : null,
            $id
        ]);

        $stmt = $pdo->prepare("SELECT * FROM collector_logs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    }

    
    if ($method === 'DELETE') {

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM collector_logs WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM collector_logs WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode([
            'message' => 'Deleted successfully',
            'item' => $row
        ]);
    }

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}

?>
