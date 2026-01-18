<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'user';  // Default role is 'user'
$firstName = $data['first_name'] ?? '';
$lastName = $data['last_name'] ?? '';
$email = $data['email'] ?? '';
$address = $data['address'] ?? '';
$adminPassword = $data['adminPassword'] ?? '';

// Check if trying to register as admin
if ($role === 'admin') {
  // Simple admin password check (you can change this password)
  define('ADMIN_REGISTRATION_PASSWORD', 'admin123');
  
  if ($adminPassword !== ADMIN_REGISTRATION_PASSWORD) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Falsches Admin-Passwort']);
    exit;
  }
}

$stmt = $link->prepare("INSERT INTO users (username, password, role, first_name, last_name, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $username, $password, $role, $firstName, $lastName, $email, $address);
if ($stmt->execute()) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false]);
}
