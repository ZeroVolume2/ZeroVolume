<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

include 'config.php';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_errno) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to connect to MySQL: " . $mysqli->connect_error
    ]);
    exit();
}
?>