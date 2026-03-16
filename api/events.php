<?php
include 'db_connect.php';

$sql = "SELECT * FROM events";
$result = $mysqli->query($sql);

if ($result === false) {
    echo json_encode(["success" => false, "message" => $mysqli->error]);
    exit();
}

$events = [];

while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

echo json_encode($events);

$result->free_result();
$mysqli->close();
?>