<?php
header('Content-Type: application/json; charset=utf-8');
require 'db.php';

$result = $link->query(
  "SELECT id, title, price, image FROM products WHERE stock > 0"
);

$products = [];

while ($row = $result->fetch_assoc()) {
  $products[] = $row;
}


echo json_encode($products, JSON_UNESCAPED_UNICODE);
