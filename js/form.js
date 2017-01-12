$(document).ready(function () {
	$("form").submit(function () {
		// Получение ID формы
		var formID = $(this).attr('id');
		// Добавление решётки к имени ID
		var formNm = $('#' + formID);
		// var message = $(formNm).find(".msgs"); // Ищет класс .msgs в текущей форме  и записываем в переменную
		// var formTitle = $(formNm).find(".formTitle"); // Ищет класс .formtitle в текущей форме и записываем в переменную
		$.ajax({
			type: "POST",
			url: 'modalform/mail.php',
			data: formNm.serialize(),
			success: function (data) {
				console.log('indeed!');
				// Вывод сообщения об успешной отправке

				console.log(data);

				$('#' + formID + ' ' + 'input').not(':input[type=submit], :input[type=hidden]').val('');
				$('.modal').each(function () {
					$(this).fadeOut();
				})
                window_offset = window.pageYOffset;
				setTimeout(function () {
					$('#modal_success').fadeIn('slow');
					$('#modal_success').find('.wrapper').customScrollbar();
					var body_width = document.body.offsetWidth;
					document.body.style.marginRight = window.innerWidth - body_width + "px";
					document.body.style.width = body_width + "px";
					document.body.style.top = "-" + window_offset + "px";
					document.body.classList.add('hidden');


				}, 1000);
			},
			error: function (jqXHR, text, error) {
				console.log('nope');

				console.log(error);

				setTimeout(function () {
					alert('Сообщение не отправлено, попробуйте еще раз!')

				}, 3000);
			}
		});
		return false;
	});
});
