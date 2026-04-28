<?php
include 'db_connect.php';

$sql = "SELECT * FROM events 
        WHERE event_date >= CURDATE()
        ORDER BY event_date ASC";

$result = $mysqli->query($sql);

if ($result === false) {
    echo json_encode([
        "success" => false,
        "message" => $mysqli->error
    ]);
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