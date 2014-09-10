/**
********************************************************************************************
* name:     Main Controller
********************************************************************************************
* This module is responsible for the UI and logic
********************************************************************************************
* desc:   responsible for the UI, logic [should be refacored]
********************************************************************************************
* code: written by Gil Tamari, you may not use it without my permission
* date: sep-2014
********************************************************************************************
**/


// The code is in vanilla JS, uncommented and untested, this is bad practice. I only did this in a very short 
// period of time for the question's sake
function Point(point){
	this.lat = 0;
	this.lng = 0;

	if (point &&
		(typeof(point.lat) === 'function')){
		this.lat = point.lat();
		this.lng = point.lng();
    } // if
    else if (point && point.hasOwnProperty('lat')){
    	this.lat = point.lat;
    	this.lng = point.lng;
    }
}

function Route(){
	this.path = []
};
Route.prototype = {
	earthRadiusInKM: 6367.5, // earth radius 

	/**
		Using Haversine distance , the earth, being a "punched" ellipsoid
		and not flat, needs a different distance measure. Haversine is an approximation
		to a sphere. Google maps uses mercator projection, so it fitts.
	**/
    distanceInKM: function( A, B){
        var temp,
        	dLat,
        	dLon,
        	a,
        	c,
        	d;

        if(A && B){
			dLat = (A.lat-B.lat)*Math.PI/180;
			dLon = (B.lng-A.lng)*Math.PI/180;
			a    = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(A.lat*Math.PI/180) * Math.cos(B.lat*Math.PI/180) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
			c    = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			d    = this.earthRadiusInKM * c;

        	return d;
        }
        else
            return 0;
    },
    getHead: function(){
    	return this.path[0];
    },
    getTail: function(){
    	return this.path[this.path.length - 1];
    },
    getLen: function(){ return this.path.length;},
    routeDistance: function(){
    	var distance = 0,
    		i,
    		path_len = this.path.length;

    	for( i = 0; i < path_len - 1; i++){
    		distance += this.distanceInKM(this.path[i], this.path[i + 1]);
    	}// for
    	return distance;
    },
    pushPoint: function(point){
    	this.path.push(point);
    },
    getPath: function(){ return this.path;},
    emptyPath: function(){this.path = [];}
};

$(document).ready(function() {

	initialize();
});

var g_first_driver  = new Route(),
	g_second_driver = new Route(),
	g_map,
	g_routes = [],
	g_turn = 1;


function initialize() {
	var mapOptions = {
		  center: new google.maps.LatLng(37.7833,-122.4167),
		  zoom: 14,
		  mapTypeControl: false,
		  panControl: false,
		  draggable: false,
		  minZoom: 14
		},
		click_event;

	g_map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);




	click_event = google.maps.event.addListener(g_map, 'click', function(e) {
		var current_driver = null,
			current_driver_obj = null,
			temp,
			msg_elements;

		if (g_turn < 3){
			current_driver = 1;
			current_driver_obj = g_first_driver;
		}
		else if (g_turn > 2 && g_turn < 5){
			current_driver = 2;
			current_driver_obj = g_second_driver;
		}
		

		g_turn++;

		if (current_driver){
			msg_elements = $('.lyft > .container > span');
			$('#msg-' + g_turn).removeClass('hide');
			msg_elements.not('#msg-' + g_turn).addClass('hide');

			temp = createDriverMarker(e.latLng,current_driver);
			
			if (temp) {g_routes.push(temp);}
			
			current_driver_obj.pushPoint(new Point(e.latLng ));

			if (current_driver_obj.getLen() > 1){
				temp = drawRoute(current_driver_obj.getPath(),current_driver);

				if (temp) {g_routes.push(temp);}
			}

		}// if

		// displaying calculation
		if (g_turn === 5){
			setTimeout(function(){
				var shortest = calcDetour(g_first_driver,g_second_driver),
					msg_elements;

				msg_elements = $('.lyft > .container > span');
				msg_elements.addClass('hide');
				$('#msg-result').removeClass('hide').text(shortest.first < shortest.second ? '1st' : '2nd' );
			},400);
		}

	});
	
	$('button.btn-lyft').click(reset);
}


function emptyPolylineRoutes(){
	var i,
		len = g_routes.length;

	for(i = 0; i < len; i++){
		g_routes[i].setMap(null);
	}

	g_routes = [];
}

function reset(){

	g_first_driver.emptyPath();
	g_second_driver.emptyPath();

	g_turn = 1;


	emptyPolylineRoutes();
	// UI changes
	$('span[id*="msg-"]').not('.hide').addClass('hide');
	$('#msg-1').removeClass('hide');
}

function calcDetour(route_first,route_second){
	// A -> B => A->C->D-B 
	// C -> D => C-A->B->D

	var temp_A_C = new Route(), // same as C->A
		temp_D_B = new Route(); // same as B->D

	temp_A_C.pushPoint(route_first.getHead()); // A
	temp_A_C.pushPoint(route_second.getHead()); // C

	dist_A_C = temp_A_C.routeDistance();

	temp_D_B.pushPoint(route_second.getTail()); // D
	temp_D_B.pushPoint(route_first.getTail()); // B

	dist_D_B = temp_D_B.routeDistance();

	return {
		first: dist_A_C + route_first.routeDistance() + dist_D_B,
		second:  dist_A_C + route_second.routeDistance() + dist_D_B
	}

}
function addMarker(mark_obj,make_shadow) {
	var map = g_map,
	    image,
	    marker,
	    options ={},
	    shadow

	image = new google.maps.MarkerImage(
	    mark_obj.src.path,
	    mark_obj.src.size,
	    mark_obj.src.anchor,
	    mark_obj.src.point
	);
	shadow = new google.maps.MarkerImage(
	    mark_obj.shadow.path,
	    mark_obj.shadow.size,
	    mark_obj.shadow.anchor,
	    mark_obj.shadow.point
	);
	options = {
	    position: mark_obj.loc,
	    map: map,
	    icon: image,
	    shadow: shadow,
	    bouncy: true,
	    visible: true
	};
	if (make_shadow){ options.shadow = shadow;}

	marker = new google.maps.Marker(options);
	mark_obj.marker = marker;

	return marker;
	
}

function drawRoute(route, driver_id){
	var route_coords = route,
		route_path = new google.maps.Polyline({
			path: route_coords,
			geodesic: true, // curved lines
			strokeColor: driver_id === 1 ? '#e062c9' : '#5663dc' ,
			strokeOpacity: 1.0,
			strokeWeight: 2
		});

  route_path.setMap(g_map);

  return route_path;
}
function createDriverMarker(position,driver_id){
	var marker_obj = {src:{},shadow:{},loc:position};


	marker_obj.src.path      = (driver_id > 1) ? 'driver2.png' : 'driver1.png';
	marker_obj.shadow.path   = 'cyan-shadow.png';

	marker_obj.src.size      = new google.maps.Size(256.0, 256.0);//(257.0, 217.0);
	marker_obj.src.anchor    = new google.maps.Point(0, 0);
	marker_obj.src.point     = new google.maps.Point(128.0, 212.0);//(128.0, 108.0);
	
	marker_obj.shadow.size   = new google.maps.Size(256.0, 256.0);//(366.0, 217.0);
	marker_obj.shadow.anchor = new google.maps.Point(0, 0);
	marker_obj.shadow.point  = new google.maps.Point(132.0, 256.0);//(128.0, 108.0);
	return addMarker(marker_obj,false); // dont create shadow
}
