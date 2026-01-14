<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$cart = $input['cart'] ?? [];

if (!is_array($cart) || count($cart) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Cart empty']);
    exit;
}

foreach ($cart as $item) {
    // Save each order to the database
    $stmt = $link->prepare("INSERT INTO orders (product, quantity, price) VALUES (?, ?, ?)");
    $stmt->bind_param("sid", $item['title'], $item['quantity'], $item['price']);
    $stmt->execute();
}

echo json_encode(['success' => true]);
