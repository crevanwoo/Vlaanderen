$('.bg_img').each(
	function () {
		$(this).css('background-image', 'url(' + $(this).find('img').attr('src') + ')')
	}
)

$('.part_3_grid .cell').on('mouseenter', function () {

	$(this).find('.hover').animate({
		opacity: 1
	}, 400)


})

$('.part_3_grid .cell').on('mouseleave', function () {

	$(this).find('.hover').animate({
		opacity: 0
	}, 0)
})




$('.part_5_right').on('mouseenter', function () {
	var img = $(this).find('img');
	img.attr('src', img.attr('data-img-2'));
})


$('.part_5_right').on('mouseleave', function () {
	var img = $(this).find('img');
	img.attr('src', img.attr('data-img-1'));
})

/* --- Range > --- */
$(".form_range.price").slider({
	animate: "fast",
	max: 100000,
	min: 10000,
	value: 55000,
	step: 100,
});



var price = $(".form_range.price").slider("value");

$(".form_range.month").slider({
	animate: "fast",
	max: 5,
	min: 1,
	value: 3,
	step: 1,

});

var month = $(".form_range.month").slider("value");

$(".form_range.price").slider({
	change: function (event, ui) {
		price = $(".form_range.price").slider("value");
		console.log($(".form_range.price").slider("value"));
		$('client_summ').val(price);
		setCurrentNumbers();
		showProducts();

	}

});


$(".form_range.month").slider({
	change: function (event, ui) {
		month = $(".form_range.month").slider("value");
		console.log($(".form_range.month").slider("value"));
		$('client_monthes').val(month);
		setCurrentNumbers();
		showProducts();

	}
});

var max_price = $(".form_range.price").slider("option", "max");
var min_price = $(".form_range.price").slider("option", "min");

function setCurrentNumbers() {
	var last_symbols = String(parseInt(price / month)).slice(-3),
		start_symbols = String(parseInt(price / month)).slice(0, -3),
		full_str = start_symbols + ' ' + last_symbols,
		num_month = parseInt(month),
		end_of_word;
	if (num_month === 1) {
		end_of_word = '';
	} else if (num_month > 1 && month < 4) {
		end_of_word = 'а'
	} else if (num_month > 4) {
		end_of_word = 'ей'
	}
	$('.calc_summ span').text(full_str);
	$('.calc_month b').text(month);
	$('.calc_month span').text(end_of_word);
}

setCurrentNumbers()


function showProducts() {
	var l_price = parseInt(price),
		l_max_price = parseInt(max_price),
		l_min_price = parseInt(min_price),
		diff = l_max_price - l_min_price,
		prod = ['.product_img_2', '.product_img_3', '.product_img_4', '.product_img_5'],
		unit = diff / 8;

	function toggleProd(i) {
		var j = i + 1;

		for (i; i >= 0; i--) {
			$(prod[i]).fadeIn()
		}

		for (j; j < prod.length; j++) {
			$(prod[j]).fadeOut()
		}
	}

	if (l_price > unit * 8) {
		toggleProd(3);
	} else if (l_price > unit * 6) {
		toggleProd(2);
	} else if (l_price > unit * 4) {
		toggleProd(1);
	} else if (l_price > unit * 2) {
		toggleProd(0);
	} else {
		toggleProd(-1);
	}
}

showProducts()

/* --- < Range  --- */

$(".part_7_tabs").tabs({
	active: 0,
	heightStyle: 'auto',
	hide: {
		effect: "fade",
		duration: 400
	},
	show: {
		effect: "fade",
		duration: 400
	},
});


$('.part_8 .slider').slick({
	dots: true,
	infinite: false,
	speed: 300,
	slidesToShow: 1,
	adaptiveHeight: true
});


/*$('.popup_wrapper').each(function() {
	
	
	$(this).addClass('default-skin');
$(this).customScrollbar();
})*/


$('.part_8_button').on('click', function () {
	var popup = $(this).parent().parent().find('.popup');

	popup.fadeToggle('slow');
	popup.find('.popup_wrapper').addClass('default-skin').customScrollbar();;

})

$('.popup .close').on('click', function () {
	var popup = $(this).parent();
	popup.fadeOut('slow');
})



/* --- Forms > --- */




$(".input_phone").mask("+7 (999) 999 9999");

$(".input_phone, .input_name").parent().append('<div class="validator_message" />');

$(".input_phone").attr('data-validation', "length");
$(".input_phone").attr('data-validation-length', "17");


$(".input_name").attr('data-validation', "custom");

$(".input_name").attr('data-validation-regexp', "^[a-zA-ZА-Яа-яЁё ]{4,}$");
$(".input_phone").addClass('form-control');
  $.validate({
  addValidClassOnAll : true,
	
  });

$('.field_name .validator_message').text('Введите имя (более 3-х букв; допускаются русские и латинские символы, пробелы)');

$('.field_phone .validator_message').text('Введите номер телефона (только цифры)');








/* --- < Forms --- */