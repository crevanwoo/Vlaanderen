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
	step: 1000,
});





var price = $(".form_range.price").slider("value");

$(".form_range.month").slider({
	animate: "fast",
	max: 4,
	min: 1,
	value: 3,
	step: 1,

});

var month = $(".form_range.month").slider("value");

$(".form_range.price").slider({
	change: function (event, ui) {
		price = $(".form_range.price").slider("value");
		console.log($(".form_range.price").slider("value"));
		$('[name="client_summ"]').val(price);
		setCurrentNumbers();
		showProducts();

	}

});


$(".form_range.month").slider({
	change: function (event, ui) {
		month = $(".form_range.month").slider("value");
		console.log($(".form_range.month").slider("value"));
		$('[name="client_monthes"]').val(month);
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


$('.part_8_button').on('click', function () {
	var popup = $(this).parent().parent().find('.popup');

	popup.fadeToggle('slow');
	popup.find('.popup_wrapper').addClass('default-skin').customScrollbar();

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
	addValidClassOnAll: true,
});

$('.field_name .validator_message').text('Введите имя (более 3-х букв; допускаются русские и латинские символы, пробелы)');

$('.field_phone .validator_message').text('Введите номер телефона (только цифры)');



/* --- < Forms --- */


/* --- Modal > --- */


$('.modal_window').on('click', function (e) {

	if (e.target.classList.contains('modal_content') || e.target.classList.contains('close') || e.target.classList.contains('modal_wrapper')) {
		modalClose(e);
	}
})



var window_offset;

function modalOpen(e) {
	e.preventDefault(); //if trigger is link
	var elem = e.target;
	console.log(elem);
	while (!elem.hasAttribute('data-modal-id')) {
		elem = elem.parentElement;
	}
	var modal_id = elem.getAttribute('data-modal-id');
	if ($('#' + modal_id).length > 0) {
		$('#' + modal_id).fadeIn('slow');
		$('#' + modal_id).find('.wrapper').customScrollbar();
		var body_width = document.body.offsetWidth;
		window_offset = window.pageYOffset;
		document.body.style.marginRight = window.innerWidth - body_width + "px";
		document.body.style.width = body_width + "px";
		document.body.style.top = "-" + window_offset + "px";
		document.body.classList.add('hidden');
	}
}

var modal_window;

function modalClose(e) {
	var elem = e.target;
	console.log(elem);
	while (!elem.classList.contains('modal')) {
		elem = elem.parentElement;
	}

	$('#' + elem.id).fadeOut('slow', modalAfterTransition);

}

function modalAfterTransition() {
	document.body.style.marginRight = 0;
	document.body.style.width = "initial";
	document.body.classList.remove('hidden');
	window.scrollTo(0, window_offset);
}

$('[data-modal-id], [data-modal-id] *').on('click', function (e) {
	modalOpen(e)
})

var gallery_index = 0;
$('[data-modal-id="modal_photo"]').on('click', function (e) {
	var url = $(this).parent().attr('data-img-url');
	gallery_index = $(this).parent().attr('data-gal');
	$('#modal_photo').find('.modal_image').attr('src', url);

})
$('#modal_photo .next').on('click', function (e) {
	gallery_index++;
	if (gallery_index >= $('[data-gal]').length) {
		gallery_index = 1;
	}
	var url = $('[' + 'data-gal="' + gallery_index + '"]').attr('data-img-url');
	$('#modal_photo').find('.modal_image').attr('src', url);

})
$('#modal_photo .prev').on('click', function (e) {
	gallery_index--;
	if (gallery_index === 0) {
		gallery_index = $('[data-gal]').length;
	}
	var url = $('[' + 'data-gal="' + gallery_index + '"]').attr('data-img-url');
	$('#modal_photo').find('.modal_image').attr('src', url);

})


//$('.modal_photo').find('.wrapper').customScrollbar();

/* --- < Modal --- */


//map


var google_map;

function initMap() {
	google_map = new google.maps.Map(document.getElementById('google_map'), {
		center: {
			lat: 51.167681,
			lng: 71.447188
		},
		zoom: 15,
		disableDefaultUI: true,


	});

	var marker_image = 'images/icon_marker.png';
	var redMarker = new google.maps.Marker({
		position: {
			lat: 51.166230,
			lng: 71.437161
		},
		map: google_map,
		icon: marker_image
	});


	var map_style = [
		{
			featureType: "all",
			stylers: [
				{
					hue: "#00d4ff"
				},
				{
					saturation: -800
				},
				{
					lightness: 50
				},
				{
					gamma: 1
				}]
		}];

	google_map.setOptions({
		styles: map_style
	});




}


$('.button, .part_1_button, .part_5_button, .part_8_button').on('mousedown', function () {
	$(this).css('transform', 'translate(1px, 2px)')
})

$('.button,.part_1_button, .part_5_button, .part_8_button').on('mouseup', function () {
	$(this).css('transform', 'translate(0px, 0px)')
})


$('.button, .part_1_button, .part_8_button').prepend('<div class="button_hover" />');

$('.button, .part_1_button, .part_8_button').on('mouseenter', function () {
	$(this).find('.button_hover').animate({
		opacity: 1
	})

})

$('.button, .part_1_button, .part_8_button').on('mouseleave', function () {
	$(this).find('.button_hover').animate({
		opacity: 0
	})

})
