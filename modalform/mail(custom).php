<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (!empty($_POST['client_name']) && (!empty($_POST['uemail']))){
    if (isset($_POST['client_name'])) {
        if (!empty($_POST['client_name'])){
          $client_name = strip_tags($_POST['client_name']) . "<br>";
          $client_nameFieldset = "<b>Имя пославшего:</b>";
         } 
    }
 
    if (isset($_POST['client_phone'])) {
        if (!empty($_POST['client_phone'])){
          $client_phone = strip_tags($_POST['client_phone']) . "<br>";
          $client_phoneFieldset = "<b>Телефон:</b>";
        }
    }
	if (isset($_POST['client_summ'])) {
        if (!empty($_POST['client_summ'])){
          $uemail = strip_tags($_POST['client_summ']) . "<br>";
          $uemailFieldset = "<b>Сумма:</b>";
        }
    }
    if (isset($_POST['client_monthes'])) {
        if (!empty($_POST['client_monthes'])){
          $formInfo = strip_tags($_POST['client_monthes']);
          $formInfoFieldset = "<b>Срок рассрочки:</b>";
        }
    }
 
    $to = "sulfurio.q@gmail.com"; /*Укажите адрес, на который должно приходить письмо*/
    $sendfrom = "evawooevawoo@gmail.com"; /*Укажите адрес, с которого будет приходить письмо */
    $headers  = "From: " . strip_tags($sendfrom) . "\r\n";
    $headers .= "Reply-To: ". strip_tags($sendfrom) . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html;charset=utf-8 \r\n";
    $headers .= "Content-Transfer-Encoding: 8bit \r\n";
    $subject = "$formInfo";
    $message = "$client_nameFieldset $client_name
                $uemailFieldset $uemail
                $client_phoneFieldset $client_phone
                $formInfoFieldset $formInfo";
 
    $send = mail ($to, $subject, $message, $headers);
        if ($send == 'true') {
            echo '<p class="success">Спасибо за отправку вашего сообщения!</p>';
        } else {
          echo '<p class="fail"><b>Ошибка. Сообщение не отправлено!</b></p>';
        }
  } else {
    echo '<p class="fail">Ошибка. Вы заполнили не все обязательные поля!</p>';
  }
} else {
  header ("Location: http://vlaanderen/"); // главная страница вашего лендинга
}
