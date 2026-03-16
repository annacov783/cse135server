<?php
session_start();

// Determine action
$action = $_POST['action'] ?? null;

if ($action === 'save' && !empty($_POST['username'])) {
    $_SESSION['username'] = $_POST['username'];
} elseif ($action === 'clear') {
    session_unset();
    session_destroy();
    header("Location: state-php.php");
    exit();
}

// Get current name
$name = $_SESSION['username'] ?? null;
?>

<!DOCTYPE html>
<html>
<head>
    <title>PHP Session Display</title>
</head>
<body>
    <h1>Session Page</h1>
    <?php if ($name): ?>
        <p><b>Name:</b> <?= htmlspecialchars($name) ?></p>
    <?php else: ?>
        <p><b>Name:</b> No name is set.</p>
    <?php endif; ?>
    <a href="state-php.php">Back to Form</a>

    <form method="post" action="state-save-php.php" style="margin-top:20px;">
        <button type="submit" name="action" value="clear">Clear Session</button>
    </form>

</body>
</html>
