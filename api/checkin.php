<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? '';
$location_name = $data['location_name'] ?? '';

if (empty($user_id) || empty($location_name)) {
    echo json_encode([
        "success" => false,
        "message" => "User ID and location are required."
    ]);
    exit();
}

$today = date("Y-m-d");

/* Check if user already checked in today at this location */
$checkSql = "SELECT checkin_id FROM check_ins WHERE user_id = ? AND location_name = ? AND checkin_date = ?";
$checkStmt = $mysqli->prepare($checkSql);
$checkStmt->bind_param("iss", $user_id, $location_name, $today);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "You have already checked in at this location today."
    ]);
    $checkStmt->close();
    $mysqli->close();
    exit();
}

$points_awarded = 10;

/* Insert check-in */
$insertSql = "INSERT INTO check_ins (user_id, location_name, checkin_date, points_awarded) VALUES (?, ?, ?, ?)";
$insertStmt = $mysqli->prepare($insertSql);
$insertStmt->bind_param("issi", $user_id, $location_name, $today, $points_awarded);

if (!$insertStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to save check-in."
    ]);
    $insertStmt->close();
    $checkStmt->close();
    $mysqli->close();
    exit();
}

/* Update user points */
$updateSql = "UPDATE users SET points = points + ? WHERE user_id = ?";
$updateStmt = $mysqli->prepare($updateSql);
$updateStmt->bind_param("ii", $points_awarded, $user_id);

if (!$updateStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Check-in saved, but failed to update points."
    ]);
    $updateStmt->close();
    $insertStmt->close();
    $checkStmt->close();
    $mysqli->close();
    exit();
}

/* Get updated points */
$userSql = "SELECT points FROM users WHERE user_id = ?";
$userStmt = $mysqli->prepare($userSql);
$userStmt->bind_param("i", $user_id);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();

echo json_encode([
    "success" => true,
    "message" => "Successfully checked in at " . $location_name . "! +10 points earned.",
    "points" => $user['points']
]);

$userStmt->close();
$updateStmt->close();
$insertStmt->close();
$checkStmt->close();
$mysqli->close();
?>