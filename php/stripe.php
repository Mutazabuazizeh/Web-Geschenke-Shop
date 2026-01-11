<?php
require './stripe-php-master/init.php';

$secretKey = getenv('STRIPE_SECRET_KEY');
$publicKey = getenv('STRIPE_PUBLIC_KEY');

\Stripe\Stripe::setApiKey($secretKey);

$session = \Stripe\Checkout\Session::create([
  'payment_method_types' => ['card'],
  'line_items' => $line_items,
  'mode' => 'payment',
  'success_url' => 'success.php',
  'cancel_url' => 'cancel.php'
]);
?>

<script src="https://js.stripe.com/v3/"></script>
<script>
  const stripe = Stripe("<?php echo $publicKey ?>");
  stripe.redirectToCheckout({
    sessionId: "<?php echo $session->id ?>"
  });
</script>
