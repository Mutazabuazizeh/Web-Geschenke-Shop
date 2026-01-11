<?php
require_once('vendor/autoload.php');

\Stripe\Stripe::setApiKey('PUT_YOUR_STRIPE_SECRET_KEY_HERE');

$amount = $_POST['amount'];

$session = \Stripe\Checkout\Session::create([
  'payment_method_types' => ['card'],
  'line_items' => [[
    'price_data' => [
      'currency' => 'eur',
      'product_data' => [
        'name' => 'Warenkorb Bestellung'
      ],
      'unit_amount' => intval($amount * 100),
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'success_url' => 'https://ivm108.informatik.htw-dresden.de/ewa/g15/Beleg/Web-Geschenke-Shop-main/php/success.php',
  'cancel_url' => 'https://ivm108.informatik.htw-dresden.de/ewa/g15/Beleg/Web-Geschenke-Shop-main/php/cancel.php',
]);

header("Location: " . $session->url);
exit;
