<?php
include 'db_connect.php';

if (!isset($_POST['user_id']) || !isset($_FILES['photo'])) {
    echo json_encode(["success" => false, "message" => "Missing user ID or photo."]);
    exit();
}

$user_id = $_POST['user_id'];
$photo = $_FILES['photo'];

$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

if (!in_array($photo['type'], $allowedTypes)) {
    echo json_encode(["success" => false, "message" => "Only JPG and PNG images are allowed."]);
    exit();
}

$uploadDir = "uploads/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$fileName = "student_" . $user_id . "_" . time() . "_" . basename($photo["name"]);
$filePath = $uploadDir . $fileName;

if (move_uploaded_file($photo["tmp_name"], $filePath)) {
    $sql = "UPDATE users SET profile_photo = ? WHERE user_id = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("si", $filePath, $user_id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Photo uploaded successfully.",
            "photo_path" => $filePath
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Database update failed."]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Photo upload failed."]);
}

$mysqli->close();
?>