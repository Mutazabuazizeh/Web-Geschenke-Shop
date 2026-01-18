<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$userId    = $input['userId'] ?? null;
$role      = $input['role'] ?? '';
$productId = $input['productId'] ?? null;
$stock     = $input['stock'] ?? null;

/* ===========================
   1. VALIDATION
=========================== */

if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!is_numeric($productId) || !is_numeric($stock)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$stock = (int)$stock;
$productId = (int)$productId;

if ($stock < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Stock cannot be negative']);
    exit;
}

/* ===========================
   2. UPDATE STOCK
=========================== */

$stmt = $link->prepare(
    "UPDATE products SET stock = ? WHERE id = ?"
);

$stmt->bind_param("ii", $stock, $productId);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Database update failed']);
    exit;
}

echo json_encode(['success' => true]);
