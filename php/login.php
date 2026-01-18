<?php
/**
 * LOGIN.PHP
 * 
 * Zweck: Authentifizierung von Benutzern
 * 
 * Eingabe: JSON mit username und password
 * 
 * Rückgabe:
 * - Erfolg: {"success": true, "user": {id, username, role}}
 * - Fehler: {"success": false} mit HTTP-Code 401
 * 
 * Die Benutzerdaten werden im Frontend in localStorage gespeichert
 */

header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// SQL-Abfrage: Benutzer mit Username und Passwort suchen
$stmt = $link->prepare("SELECT id, username, role FROM users WHERE username=? AND password=?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

// Benutzer gefunden? -> Login erfolgreich
if ($user = $result->fetch_assoc()) {
  echo json_encode([
    'success' => true,
    'user' => $user
  ]);
} else {
  // Benutzer nicht gefunden -> Login fehlgeschlagen
  http_response_code(401);
  echo json_encode(['success' => false]);
}
