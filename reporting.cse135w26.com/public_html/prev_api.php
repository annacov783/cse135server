<?php


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
//$path = $_SERVER['PATH_INFO'] ?? '/';
//$parts = explode('/', trim($path, '/'));
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($uri, '/'));
$resource = $parts[1] ?? '';
$id = isset($parts[2]) ? (int)$parts[1] : null;

// Only handle /items routes
if ($resource !== 'items') {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

// Load data from JSON file
$dataFile = __DIR__ . '/../data/items.json';
$items = json_decode(file_get_contents($dataFile), true) ?: [];

if ($method === 'GET') {
    if ($id !== null) {
        // GET /items/:id - Find one item
        $item = null;
        foreach ($items as $i) {
            if ($i['id'] === $id) {
                $item = $i;
                break;
            }
        }
        if (!$item) {
            http_response_code(404);
            echo json_encode(['error' => 'Item not found']);
            exit;
        }
        echo json_encode($item);
    } else {
        // GET /items - Return all items
        echo json_encode($items);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }

    // Generate next ID
    $maxId = 0;
    foreach ($items as $i) {
        if ($i['id'] > $maxId) $maxId = $i['id'];
    }

    $newItem = [
        'id'        => $maxId + 1,
        'name'      => $data['name'],
        'completed' => false
    ];

    $items[] = $newItem;
    file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT));

    http_response_code(201);
    echo json_encode($newItem);
}


if ($method === 'PUT') {
    if ($id === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Item ID required']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $found = false;

    foreach ($items as &$item) {
        if ($item['id'] === $id) {
            if (isset($data['name']))      $item['name'] = $data['name'];
            if (isset($data['completed'])) $item['completed'] = (bool)$data['completed'];
            $found = true;
            $updated = $item;
            break;
        }
    }
    unset($item); // break reference

   if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        exit;
    }

    file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT));
    echo json_encode($updated);
}


if ($method === 'DELETE') {
    if ($id === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Item ID required']);
        exit;
    }

    $found = false;
    $deleted = null;
    foreach ($items as $index => $item) {
        if ($item['id'] === $id) {
            $deleted = $item;
            array_splice($items, $index, 1);
            $found = true;
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        exit;
    }

    file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT));
    echo json_encode(['message' => 'Item deleted', 'item' => $deleted]);
}



?>

                                                                                                                                                                                                                                                                                                                                                                                                                                                              79,1          Top
