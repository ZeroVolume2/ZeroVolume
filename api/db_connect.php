<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "2463745", "Arghya@117278", "db2463745");

if ($mysqli->connect_errno) {
    echo json_encode(["success" => false, "message" => "Failed to connect to MySQL: " . $mysqli->connect_error]);
    exit();
}
?>