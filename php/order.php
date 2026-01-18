<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$cart = $input['cart'] ?? [];
$userId = $input['userId'] ?? null;
$total = $input['total'] ?? 0;

// Debug logging
error_log('Order.php input: ' . json_encode($input));
error_log('userId received: ' . var_export($userId, true));

if (!is_array($cart) || count($cart) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Cart empty']);
    exit;
}

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User not logged in', 'userId' => $userId, 'input' => $input]);
    exit;
}

// Save the entire order with cart_json
$cartJson = json_encode($cart);
$status = 'pending';

$stmt = $link->prepare("INSERT INTO orders (user_id, cart_json, total, status) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $userId, $cartJson, $total, $status);

if ($stmt->execute()) {
    $orderId = $link->insert_id;
    echo json_encode(['success' => true, 'orderId' => $orderId]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create order']);
}
