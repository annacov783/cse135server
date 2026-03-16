<?php
session_start();

$name = $_SESSION['username'] ?? null;

?>

<!DOCTYPE html>
<html>
<head>
    <title>PHP Session Form</title>
</head>
<body>
    <h1>Session Testing: Enter Your Name</h1>

    <?php if ($name): ?>
        <p><b>Currently saved name:</b> <?= htmlspecialchars($name) ?></p>
    <?php else: ?>
        <p><b>No name is currently saved.</b></p>
    <?php endif; ?>

    <form method="post" action="state-save-php.php">
        <input type="text" name="username" placeholder="Your Name">
        <button type="submit" name="action" value="save">Save</button>
       
    </form>
</body>
</html>










