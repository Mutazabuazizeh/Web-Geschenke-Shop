<?php
/**
 * CREATE-CHECKOUT-SESSION.PHP
 * 
 * Zweck: Erstellt eine Stripe Checkout-Session für die Zahlung
 * 
 * Eingabe: JSON mit:
 * - cart: Warenkorb (aktuell nicht für einzelne Positionen verwendet)
 * - orderId: ID der zuvor erstellten Bestellung
 * - total: Gesamtpreis inkl. MwSt (vom Frontend berechnet)
 * 
 * Rückgabe: {"url": "https://checkout.stripe.com/..."}
 * 
 * Besonderheit: 
 * - Verwendet den exakten Gesamtpreis vom Frontend
 * - Leitet zur Stripe-Zahlungsseite weiter
 * - Bei Erfolg: Weiterleitung zu success.php
 * - Bei Abbruch: Zurück zu cart.html
 */

require __DIR__ . '/stripe-php-master/init.php';
require __DIR__ . '/stripkeys.php';

// Stripe API-Schlüssel setzen
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$cart = $data['cart'] ?? [];
$orderId = $data['orderId'] ?? null;
$totalFromFrontend = $data['total'] ?? null;

// ===== VALIDIERUNG =====
if (!is_array($cart) || count($cart) === 0) {
  http_response_code(400);
  echo json_encode(['error' => 'Cart empty']);
  exit;
}

if (!$orderId) {
  http_response_code(400);
  echo json_encode(['error' => 'Order ID missing']);
  exit;
}

if ($totalFromFrontend === null) {
  http_response_code(400);
  echo json_encode(['error' => 'Total price missing']);
  exit;
}

// ===== STRIPE LINE ITEMS ERSTELLEN =====
$lineItems = [];

// Gesamtpreis von Euro in Cent umrechnen (Stripe benötigt Cent)
$totalCents = (int) round($totalFromFrontend * 100);

// Einzelne Line-Item mit Gesamtpreis
$lineItems[] = [
  'price_data' => [
    'currency' => 'eur',
    'product_data' => [
      'name' => 'Bestellung'  // Produktname in Stripe
    ],
    'unit_amount' => $totalCents  // Preis in Cent
  ],
  'quantity' => 1
];

// ===== STRIPE CHECKOUT SESSION ERSTELLEN =====
$baseUrl = 'https://ivm108.informatik.htw-dresden.de/ewa/g15/Beleg/Web-Geschenke-Shop-main/';

$session = \Stripe\Checkout\Session::create([
  'payment_method_types' => ['card'],  // Nur Kreditkarte
  'line_items' => $lineItems,
  'mode' => 'payment',                 // Einmalige Zahlung
  'success_url' => $baseUrl . 'success.php?session_id={CHECKOUT_SESSION_ID}&order_id=' . $orderId,
  'cancel_url' => $baseUrl . 'cart.html'
]);

// Stripe Checkout URL zurückgeben
echo json_encode(['url' => $session->url]);
