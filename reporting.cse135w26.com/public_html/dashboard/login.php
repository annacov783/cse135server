<?php
session_start();

header('Content-Type: application/json');

$USERNAME = 'grader_admin';
$PASSWORD = 'ha.974.egd'; 

$USERNAME_ANALYST = 'analyst';
$PASSWORD_ANALYST = 'fn.e4y.3g5fm';

$USERNAME_VIEWER = 'viewer';
$PASSWORD_VIEWER = 'scn473.8hk';

#if ($_SERVER['REQUEST_METHOD'] === 'POST') {

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';


$role = null;

if ($username === $USERNAME && $password === $PASSWORD) {
    $role = 'admin';
}

elseif ($username === $USERNAME_ANALYST && $password === $PASSWORD_ANALYST) {
    $role = 'analyst';
}

elseif ($username === $USERNAME_VIEWER && $password === $PASSWORD_VIEWER) {
    $role = 'viewer';
}


/*login attempt result*/
if ($role !== null) {

    $_SESSION['logged_in'] = true;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = $role;

    echo json_encode([
        'success' => true,
        'role' => $role
    ]);

} else {

    echo json_encode([
        'success' => false,
        'error' => 'Invalid username or password'
    ]);

}

exit;

/*
if ($username === $USERNAME && $password === $PASSWORD) {
    $_SESSION['logged_in'] = true;
    echo json_encode(['success' => true]);
    #header("Location: dashboard.php");
    exit;
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid username or password']);
    #header("Location: login.html?error=Invalid+credentials");
    exit;
}

 */



?>
