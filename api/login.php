<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$university_email = $data['university_email'] ?? '';
$password = $data['password'] ?? '';

if (empty($university_email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$sql = "SELECT * FROM users WHERE university_email = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("s", $university_email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Account not found."]);
    exit();
}

$user = $result->fetch_assoc();

if ($user['password'] !== $password) {
    echo json_encode(["success" => false, "message" => "Incorrect password."]);
    exit();
}

echo json_encode([
    "success" => true,
    "user" => [
        "user_id" => $user['user_id'],
        "name" => $user['full_name'],
        "email" => $user['university_email'],
        "points" => $user['points']
    ]
]);

$stmt->close();
$mysqli->close();
?>