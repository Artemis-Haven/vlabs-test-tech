var $ = require('jquery');
window.$ = $;
require('bootstrap-sass');

		$('body').on('submit', '#new_point_form', function (e) {
	        e.preventDefault();
	        $.ajax({
	            type: $(this).attr('method'),
	            url:  $(this).attr('action'),
	            data: $(this).serialize()
	        })
	        .done(function (data) {
	        	var name = $('#point_name').val();
	        	var address = $('#point_address').val();
	        	var latitude = $('#point_latitude').val();
	        	var longitude = $('#point_longitude').val();
	            addPointToMap(name, address, latitude, longitude);
	            $('#new_point_form input').val('');
	        })
	        .fail(function (jqXHR, textStatus, errorThrown) {
	            if (typeof jqXHR.responseJSON !== 'undefined') {
	                if (jqXHR.responseJSON.hasOwnProperty('form')) {
	                    console.log(jqXHR.responseJSON.form);
	                }
	                console.log(jqXHR.responseJSON.message);
	            } else {
	                alert(errorThrown);
	            }
	        });
	    });

	    function addPointToMap(name, address, latitude, longitude) {
	    	console.log('TODO: addPointToMap');
	    }


		function initMap() {
			var coords = $('article.pointOfInterest').map(function (index, elt) {
				return {
					lat: parseFloat($(elt).data('lat')), 
					lng: parseFloat($(elt).data('long'))
				};
			})
			var map = new google.maps.Map(document.getElementById('map'), {
				zoom: 11,
				center: {lat: 48.859, lng: 2.35}
			});
			coords.each(function(index, elt) {
				var marker = new google.maps.Marker({
					position: elt,
					map: map
				});
			})
		}
		window.initMap = initMap;
