<?
if((isset($_POST['uname'])&&$_POST['uname']!="")&&(isset($_POST['uphone'])&&$_POST['uphone']!="")){ //Проверка отправилось ли наше поля name и не пустые ли они
	
        $to = 'stasya.job@outlook.com'; //Почта получателя, через запятую можно указать сколько угодно адресов
        $subject = 'Обратный звонок'; //Загаловок сообщения
        $message = '
                <html>
                    <head>
                        <title>'.$subject.'</title>
                    </head>
                    <body>
                        <p>Имя: '.$_POST['uname'].'</p>
                        <p>Телефон: '.$_POST['uphone'].'</p> 
                    </body>
                </html>'; //Текст нащего сообщения можно использовать HTML теги
        $headers  = "Content-type: text/html; charset=utf-8 \r\n"; //Кодировка письма
        $headers .= "From: Отправитель <from@example.com>\r\n"; //Наименование и почта отправителя
        mail($to, $subject, $message, $headers); //Отправка письма с помощью функции mail
}

?>
