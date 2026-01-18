<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// fetch orders with buyer info
$ordersResult = $link->query(
    "SELECT o.id, o.total, o.status, o.created_at, o.buyer_name, u.address 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ORDER BY o.created_at DESC"
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
