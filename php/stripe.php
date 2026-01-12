<?php
require __DIR__ . '/stripe-php-master/init.php';
require __DIR__ . '/stripkeys.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

header('Content-Type: application/json; charset=utf-8');


$input = json_decode(file_get_contents('php://input'), true);
$cart  = $input['cart'] ?? [];

if (!is_array($cart) || count($cart) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Cart empty']);
    exit;
}

$lineItems = [];

foreach ($cart as $item) {
    if (!isset($item['title'], $item['price'], $item['quantity'])) {
        continue;
    }

    $lineItems[] = [
        'price_data' => [
            'currency' => 'eur',
            'product_data' => [
                'name' => $item['title']
            ],
            'unit_amount' => (int) round($item['price'] * 100)
        ],
        'quantity' => (int) $item['quantity']
    ];
}

if (count($lineItems) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid items']);
    exit;
}


$baseUrl = 'https://ivm108.informatik.htw-dresden.de/ewa/g15/Beleg/Web-Geschenke-Shop-main/php/';

try {
    $session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => $lineItems,
        'mode' => 'payment',
        'success_url' => $baseUrl . 'success.php',
        'cancel_url'  => $baseUrl . 'cancel.php'
    ]);

    echo json_encode(['url' => $session->url]);

} catch (\Stripe\Exception\ApiErrorException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
