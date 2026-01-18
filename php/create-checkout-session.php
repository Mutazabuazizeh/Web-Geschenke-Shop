<?php
require __DIR__ . '/stripe-php-master/init.php';
require __DIR__ . '/stripkeys.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
$cart = $data['cart'] ?? [];
$orderId = $data['orderId'] ?? null;

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

$lineItems = [];

foreach ($cart as $item) {
  $lineItems[] = [
    'price_data' => [
      'currency' => 'eur',
      'product_data' => [
        'name' => $item['title']
      ],
      'unit_amount' => (int) round($item['price'] * 100)
    ],
    'quantity' => $item['quantity']
  ];
}

$baseUrl = 'https://ivm108.informatik.htw-dresden.de/ewa/g15/Beleg/Web-Geschenke-Shop-main/';

$session = \Stripe\Checkout\Session::create([
  'payment_method_types' => ['card'],
  'line_items' => $lineItems,
  'mode' => 'payment',
  'success_url' => $baseUrl . 'success.php?session_id={CHECKOUT_SESSION_ID}&order_id=' . $orderId,
  'cancel_url' => $baseUrl . 'cart.html'
]);

echo json_encode(['url' => $session->url]);
