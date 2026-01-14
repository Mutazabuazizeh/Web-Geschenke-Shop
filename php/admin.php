<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// fetch orders
$ordersResult = $link->query(
    "SELECT id, total, status, created_at FROM orders ORDER BY created_at DESC"
);

$orders = [];
while ($row = $ordersResult->fetch_assoc()) {
    $orders[] = $row;
}

// fetch products
$productsResult = $link->query(
    "SELECT id, title, price, stock FROM products"
);

$products = [];
while ($row = $productsResult->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode([
    'orders' => $orders,
    'products' => $products
]);
