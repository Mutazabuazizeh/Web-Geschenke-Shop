<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $link->prepare("SELECT id, username, role FROM users WHERE username=? AND password=?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
  echo json_encode([
    'success' => true,
    'user' => $user
  ]);
} else {
  http_response_code(401);
  echo json_encode(['success' => false]);
}
