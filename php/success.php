<?php
require 'db.php';
require __DIR__ . '/stripe-php-master/init.php';
require __DIR__ . '/stripkeys.php';

\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

if (!isset($_GET['session_id'], $_GET['order_id'])) {
    exit('Missing data');
}

$orderId   = (int) $_GET['order_id'];
$sessionId = $_GET['session_id'];

try {
    $session = \Stripe\Checkout\Session::retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        exit('Payment not completed');
    }

    // 1️⃣ get order
    $stmt = $link->prepare("SELECT cart_json FROM orders WHERE id=?");
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();

    if (!$order) {
        exit('Order not found');
    }

    $cart = json_decode($order['cart_json'], true);

    // 2️⃣ reduce stock
    foreach ($cart as $item) {
        $stmt = $link->prepare(
            "UPDATE products
             SET stock = stock - ?
             WHERE id = ? AND stock >= ?"
        );
        $stmt->bind_param(
            "iii",
            $item['quantity'],
            $item['id'],
            $item['quantity']
        );
        $stmt->execute();
    }

    // 3️⃣ update order status
    $stmt = $link->prepare(
        "UPDATE orders SET status='paid' WHERE id=?"
    );
    $stmt->bind_param("i", $orderId);
    $stmt->execute();

} catch (Exception $e) {
    exit('Stripe error');
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Zahlung erfolgreich</title>
</head>
<body>

<h1>Vielen Dank!</h1>
<p>Ihre Zahlung war erfolgreich.</p>
<p>Status: <b>paid</b></p>

<a href="../index.html">Zurück zum Shop</a>

<script>
  localStorage.removeItem('cart');
</script>

</body>
</html>
