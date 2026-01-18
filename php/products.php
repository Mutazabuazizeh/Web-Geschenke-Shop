<?php
/**
 * PRODUCTS.PHP
 * 
 * Zweck: Lädt alle Produkte aus der Datenbank, die auf Lager sind
 * 
 * Rückgabe: JSON-Array mit Produkten (id, title, price, image, stock)
 * 
 * Wird verwendet von: index.html (beim Laden der Seite)
 */

header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// SQL-Abfrage: Hole alle Produkte mit Lagerbestand > 0
$result = $link->query(
  "SELECT id, title, price, image, stock FROM products WHERE stock > 0"
);

$products = [];

// Alle Ergebnisse in Array sammeln
while ($row = $result->fetch_assoc()) {
  $products[] = $row;
}

// Als JSON zurückgeben
echo json_encode($products, JSON_UNESCAPED_UNICODE);
