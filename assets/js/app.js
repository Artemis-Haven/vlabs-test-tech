var $ = require('jquery');
window.$ = $;
require("jquery-ui/ui/widgets/autocomplete");
require('bootstrap-sass');

var map;
var geocoder;
var autocompleteChoices = [];
var delayer = false;

/**
 * Initialisation de la Map
 */
function initMap() {
	// Récupérer les coordonnées des points d'intérêt
	var coords = $('article.pointOfInterest').map(function (index, elt) {
		return {
			lat: parseFloat($(elt).data('lat')), 
			lng: parseFloat($(elt).data('long'))
		};
	})
	// Créer la carte
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 11,
		center: {lat: 48.859, lng: 2.35}
	});
	// Ajouter un marqueur par point d'intérêt sur la carte
	coords.each(function(index, elt) {
		var marker = new google.maps.Marker({
			position: elt,
			map: map
		});
	})
	// Créer le geocoder
	geocoder = new google.maps.Geocoder();
}
window.initMap = initMap;

/**
 * Gestion de l'autocomplétion du champ "Adresse"
 */
$('body').on('keyup', '#point_address', function (e) {
	if (!delayer) {
		delayer = true;
		setTimeout(function() {
			delayer = false;
		}, 2000);

		$( "#point_address" ).autocomplete({
			source: function(request,response) {
				geocoder.geocode( {'address': request.term }, function(results, status) {
					response($.map(results, function(item) {
						return {
							label: item.formatted_address,
							value: item.formatted_address,
							geocode: item
						}
					}));
				});
			},		
			select: function(event,ui){
				$( "#point_address" ).val(ui.item.geocode.formatted_address);
				$( "#point_latitude" ).val(ui.item.geocode.geometry.location.lat());
				$( "#point_longitude" ).val(ui.item.geocode.geometry.location.lng());
			}
		});
	}
});

/**
 * Gestion de la validation du formulaire
 */
$('body').on('submit', '#new_point_form', function (e) {
	// Lors de la soumission du formulaire, envoi d'une requête AJAX
	// au lieu de changer de page
    e.preventDefault();
    $.ajax({
        type: $(this).attr('method'),
        url:  $(this).attr('action'),
        data: $(this).serialize()
    })
    .done(function (data) {
    	// Lorsque le point est bien créé en BdD, l'ajouter sur la carte
    	var name = $('#point_name').val();
    	var address = $('#point_address').val();
    	var latitude = $('#point_latitude').val();
    	var longitude = $('#point_longitude').val();
        addPointToMap(name, address, latitude, longitude);
        $('#new_point_form input').val('');
        $('#newPointModal').modal('hide');
        $('#noPoint').remove();
        $('#pointsList').append(data.html);
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

/**
 * Ajout d'un marqueur sur la carte
 */
function addPointToMap(name, address, latitude, longitude) {
	new google.maps.Marker({
		position: {
			lat: parseFloat(latitude),
			lng: parseFloat(longitude)
		},
		map: map
	});
}

/**
 * Centrer la carte sur les coordonnées passées en paramètre
 */
function goToPoint(latitude, longitude) {
	map.panTo(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
}

/**
 * Au clic sur un bouton "Localiser", centrer la carte sur le point.
 */
$('body').on('click', '.poi-find', function() {
	var $point = $(this).closest('.pointOfInterest');
	goToPoint($point.data('lat'), $point.data('long'));
});


/**
 * Autocomplete lorsque l'on saisi du texte dans le champ "Rechercher un point d'intérêt"
 * Recherche parmi tous les points d'intérêts existants
 */
$('body').on('keyup', '#searchBox', function (e) {
	$( "#searchBox" ).autocomplete({
		source: function(request,response) {
			// Récupérer les noms et coordonnées de chaque point dans la liste
			response($('.pointOfInterest').map(function(index, elt) {
				return {
					label: $(elt).find('.poi-name').text(),
					lat: $(elt).data('lat'),
					long: $(elt).data('long'),
				}
			}).filter(function (index, elt) {
				return (elt.label.toLowerCase().indexOf(request.term.toLowerCase()) !== -1);
			}));
		},
		select: function(event,ui){
			// Lorsqu'un élément est sélectionné, centrer la carte sur lui
			goToPoint(ui.item.lat, ui.item.long);
		}
	}).autocomplete( "instance" )._renderItem = function( ul, item ) {
		// Afficher les éléments de la liste déroulante avec le terme recherché en gras
		var term = $( "#searchBox" ).val().toLowerCase();
		var markerIcon = "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'>";
		var labelBeforeTerm = item.label.substring(0, item.label.toLowerCase().indexOf(term));
		var termInLabel = item.label.substring(item.label.toLowerCase().indexOf(term), item.label.toLowerCase().indexOf(term) + term.length);
		var labelAfterTerm = item.label.substring(item.label.toLowerCase().indexOf(term) + term.length);
      	return $('<li>')
      		.append( markerIcon+" <div>" + labelBeforeTerm + "<strong>" + term + "</strong>" + labelAfterTerm + "</div>" )
	        .appendTo( ul );
    };
});

