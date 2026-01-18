<?php
/**
 * ADMIN.PHP
 * 
 * Zweck: Lädt Daten für den Admin-Bereich
 * 
 * Rückgabe: JSON mit zwei Arrays:
 * - orders: Alle Bestellungen mit Käuferinformationen und bestellten Produkten
 * - products: Alle Produkte für Lagerbestandsverwaltung
 * 
 * Wird verwendet von: admin.html (beim Laden der Seite)
 */

header('Content-Type: application/json; charset=utf-8');
require 'db.php';

// ===== BESTELLUNGEN LADEN =====
// Hole alle Bestellungen mit Benutzer-Adresse und Warenkorb-Daten
$ordersResult = $link->query(
    "SELECT o.id, o.total, o.status, o.created_at, o.buyer_name, u.address, o.cart_json
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ORDER BY o.created_at DESC"
);

$orders = [];
while ($row = $ordersResult->fetch_assoc()) {
    // Warenkorb-JSON in Array umwandeln für Anzeige der bestellten Produkte
    $row['items'] = json_decode($row['cart_json'], true) ?? [];
    unset($row['cart_json']);  // cart_json nicht mehr benötigt
    $orders[] = $row;
}

// ===== PRODUKTE LADEN =====
// Hole alle Produkte für Lagerbestandsverwaltung
$productsResult = $link->query(
    "SELECT id, title, price, stock FROM products"
);

$products = [];
while ($row = $productsResult->fetch_assoc()) {
    $products[] = $row;
}

// ===== RÜCKGABE =====
echo json_encode([
    'orders' => $orders,
    'products' => $products
]);
