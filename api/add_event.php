<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$event_title = $data['event_title'] ?? '';
$event_location = $data['event_location'] ?? '';
$event_date = $data['event_date'] ?? '';
$event_time = $data['event_time'] ?? '';
$event_description = $data['event_description'] ?? '';

if (
    empty($event_title) ||
    empty($event_location) ||
    empty($event_date) ||
    empty($event_time)
) {
    echo json_encode([
        "success" => false,
        "message" => "Event title, location, date and time are required."
    ]);
    exit();
}

$sql = "INSERT INTO events 
        (event_title, event_location, event_date, event_time, event_description)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $mysqli->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare event query."
    ]);
    exit();
}

$stmt->bind_param(
    "sssss",
    $event_title,
    $event_location,
    $event_date,
    $event_time,
    $event_description
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Event added successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to add event."
    ]);
}

$stmt->close();
$mysqli->close();
?>