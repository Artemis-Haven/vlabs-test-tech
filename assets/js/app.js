var $ = require('jquery');
window.$ = $;
require("jquery-ui/ui/widgets/autocomplete");
require('bootstrap-sass');

var map;
var markers = [];
var geocoder;
var autocompleteChoices = [];
var delayer = false;
var infoWindow;

/**
 * Initialisation de la Map
 */
function initMap() {
	// Récupérer les coordonnées des points d'intérêt
	var coords = $('article.pointOfInterest').map(function (index, elt) {
		return {
			name: $(elt).find('.poi-name').text(),
			address: $(elt).find('.poi-address').text(),
			lat: parseFloat($(elt).data('lat')), 
			lng: parseFloat($(elt).data('long'))
		};
	})
	// Créer la carte
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: {lat: 48.859, lng: 2.35},
	    disableDefaultUI: true
	});
	// Créer la popup de détail
	infoWindow = new google.maps.InfoWindow({
		content: "Point d'intérêt"
    });

	// Ajouter un marqueur par point d'intérêt sur la carte
	coords.each(function(index, elt) {
		var marker = addPointToMap(elt.name, elt.address, elt.lat, elt.lng);
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
			},
			appendTo: "#newPointModal"
		}).autocomplete( "instance" )._renderItem = function( ul, item ) {
			// Afficher les éléments de la liste déroulante avec le terme recherché en gras
			var term = $( "#point_address" ).val().toLowerCase();
			return formatAutocompleteItem(term, item.label).appendTo(ul);
	    };
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
    	// Lorsque le point est bien créé en BdD, l'ajouter sur la carte et l'afficher
    	var name = $('#point_name').val();
    	var address = $('#point_address').val();
    	var latitude = $('#point_latitude').val();
    	var longitude = $('#point_longitude').val();
        var marker = addPointToMap(name, address, latitude, longitude);
        goToPoint(name, address, latitude, longitude);
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
	var marker = new google.maps.Marker({
		icon: 'img/map_marker.png',
		position: {
			name: name,
			address: address,
			lat: parseFloat(latitude),
			lng: parseFloat(longitude)
		},
		map: map
	});
	markers.push(marker);
	// Au clic, centrer sur le point et afficher la popup
	marker.addListener('click', function() {
		goToPoint(name, address, latitude, longitude);
	});

	return marker;
}

/**
 * Centrer la carte sur les coordonnées passées en paramètre et afficher la popup
 */
function goToPoint(name, address, latitude, longitude) {
	infoWindow.setContent(
		'<div class="popup-name">'+name+'</div>'+
		'<div class="popup-address">'+address+'</div>'
	);
	map.panTo(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
	infoWindow.open(map, findClosestMarker(parseFloat(latitude), parseFloat(longitude)));
}

/**
 * Au clic sur un bouton "Localiser", centrer la carte sur le point.
 */
$('body').on('click', '.poi-find', function() {
	var $point = $(this).closest('.pointOfInterest');
	goToPoint(
		$point.find('.poi-name').text(), 
		$point.find('.poi-address').text(), 
		$point.data('lat'), 
		$point.data('long')
	);
});


/**
 * Autocomplete lorsque l'on saisi du texte dans le champ "Rechercher un point d'intérêt"
 * Recherche parmi tous les points d'intérêts existants
 */
$('body').on('keyup', '#searchBox input', function (e) {
	$( "#searchBox input" ).autocomplete({
		source: function(request,response) {
			// Récupérer les noms et coordonnées de chaque point dans la liste
			response($('.pointOfInterest').map(function(index, elt) {
				return {
					label: $(elt).find('.poi-name').text(),
					address: $(elt).find('.poi-address').text(),
					lat: $(elt).data('lat'),
					long: $(elt).data('long'),
				}
			}).filter(function (index, elt) {
				return (elt.label.toLowerCase().indexOf(request.term.toLowerCase()) !== -1);
			}));
		},
		select: function(event,ui){
			// Lorsqu'un élément est sélectionné, centrer la carte sur lui
			goToPoint(ui.item.label, ui.item.address, ui.item.lat, ui.item.long);
		},
		appendTo: "#searchBox"
	}).autocomplete( "instance" )._renderItem = function( ul, item ) {
		// Afficher les éléments de la liste déroulante avec le terme recherché en gras
		var term = $( "#searchBox input" ).val().toLowerCase();
		return formatAutocompleteItem(term, item.label).appendTo(ul);
    };
});

/**
 * Formate le label passé en paramètre en ajoutant une icone de marqueur en début de texte
 * et en mettant le terme passé en paramètre en gras.
 */
function formatAutocompleteItem(term, label) {
	var markerIcon = "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span>";
	var labelBeforeTerm = label.substring(0, label.toLowerCase().indexOf(term));
	var termInLabel = label.substring(label.toLowerCase().indexOf(term), label.toLowerCase().indexOf(term) + term.length);
	var labelAfterTerm = label.substring(label.toLowerCase().indexOf(term) + term.length);
  	return $('<li>').append( markerIcon+" <div>" + labelBeforeTerm + "<strong>" + termInLabel + "</strong>" + labelAfterTerm + "</div>" );
}


/**
 * Trouver le marqueur le plus proche des coordonnées passées en paramètre
 * 
 * Source : https://stackoverflow.com/questions/4057665/google-maps-api-v3-find-nearest-markers
 */
function rad(x) {return x*Math.PI/180;}
function findClosestMarker( lat, lng ) {
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
    for( i=0;i<markers.length; i++ ) {
        var mlat = markers[i].position.lat();
        var mlng = markers[i].position.lng();
        var dLat  = rad(mlat - lat);
        var dLong = rad(mlng - lng);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        distances[i] = d;
        if ( closest == -1 || d < distances[closest] ) {
            closest = i;
        }
    }

    return markers[closest];
}