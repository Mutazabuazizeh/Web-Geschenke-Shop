<?php
/**
 * REGISTER.PHP
 * 
 * Zweck: Registrierung neuer Benutzer
 * 
 * Eingabe: JSON mit Benutzerdaten (username, password, role, etc.)
 * Besonderheit: Admin-Registrierung benötigt zusätzliches Admin-Passwort
 * 
 * Rückgabe: 
 * - Erfolg: {"success": true}
 * - Fehler: {"success": false, "error": "Fehlermeldung"}
 */

header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

// Benutzerdaten aus Request extrahieren
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'user';  // Standard-Rolle: 'user'
$firstName = $data['first_name'] ?? '';
$lastName = $data['last_name'] ?? '';
$email = $data['email'] ?? '';
$address = $data['address'] ?? '';
$adminPassword = $data['adminPassword'] ?? '';

// ===== ADMIN-REGISTRIERUNG PRÜFEN =====
if ($role === 'admin') {
  // Admin-Passwort definieren (kann geändert werden)
  define('ADMIN_REGISTRATION_PASSWORD', 'admin123');
  
  // Prüfen ob Admin-Passwort korrekt ist
  if ($adminPassword !== ADMIN_REGISTRATION_PASSWORD) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Falsches Admin-Passwort']);
    exit;
  }
}

// ===== BENUTZER IN DATENBANK EINFÜGEN =====
$stmt = $link->prepare("INSERT INTO users (username, password, role, first_name, last_name, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $username, $password, $role, $firstName, $lastName, $email, $address);

if ($stmt->execute()) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false]);
}
