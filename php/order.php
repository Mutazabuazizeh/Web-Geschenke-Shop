<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['cart'])) {
  http_response_code(400);
  echo json_encode(["success" => false]);
  exit;
}

$order = [
  "date" => date("Y-m-d H:i:s"),
  "cart" => $data['cart'],
  "total" => $data['total']
];

$file = "orders.json";

$orders = [];
if (file_exists($file)) {
  $orders = json_decode(file_get_contents($file), true);
}

$orders[] = $order;

file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
