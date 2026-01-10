<?php
$host = "localhost";
$user = "g15";
$password = "ma73man";
$db = "g15";

$link = new mysqli($host, $user, $password, $db);

if ($link->connect_error) {
  http_response_code(500);
  die("DB connection failed");
}
