<?php
header('Content-Type: application/json');

$products = [
  [
    "id" => 1,
    "title" => "Weihnachtsbuch",
    "price" => 19.9,
    "image" => "./img/book.png"
  ],
  [
    "id" => 2,
    "title" => "Kerze",
    "price" => 9.5,
    "image" => "./img/candle.png"
  ]
];

echo json_encode($products);
