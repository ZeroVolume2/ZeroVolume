<?php
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$full_name = $data['full_name'] ?? '';
$university_email = $data['university_email'] ?? '';
$password = $data['password'] ?? '';

if (empty($full_name) || empty($university_email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit();
}

$checkSql = "SELECT * FROM users WHERE university_email = ?";
$checkStmt = $mysqli->prepare($checkSql);
$checkStmt->bind_param("s", $university_email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
    exit();
}

$sql = "INSERT INTO users (full_name, university_email, password) VALUES (?, ?, ?)";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("sss", $full_name, $university_email, $password);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Account created successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Signup failed."]);
}

$stmt->close();
$mysqli->close();
?>