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


// The code is in vanilla JS, self-contained and untested, this is bad practice. I only did this in a very short 
// period of time for the question's sake

// global variables
var g_first_driver  = new Route(), // first driver
	g_second_driver = new Route(), // second driver
	g_map, // map object
	g_routes = [], // polylines - routes
	g_turn = 1; // which turn is it now



// defining Point Object
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
// defining Route Object
function Route(){
	this.path = []
};
Route.prototype = {
	earthRadiusInKM: 6367.5, // earth radius 

	/************************************************************************
	*   name:  isCarouselAreaHidden
	*   desc:  Using Haversine distance , the earth, being a "punched" ellipsoid
	*	and not flat, needs a different distance measure. Haversine is an approximation
	*	to a sphere. Google maps uses mercator projection, so it fitts.
	*	we use trigo to compensate for the curvature of the earth
	*************************************************************************
	*   in:    A,B - Point
	*************************************************************************
	*   out:   float - distance
	*************************************************************************
	*/
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
    // getting the 1st point of the route
    getHead: function(){
    	return this.path[0];
    },
    // getting he last point of the route
    getTail: function(){
    	return this.path[this.path.length - 1];
    },
    // getting the route's length
    getLen: function(){ return this.path.length;},
    // the distance of the route in KM
    routeDistance: function(){
    	var distance = 0,
    		i,
    		path_len = this.path.length;

    	for( i = 0; i < path_len - 1; i++){
    		distance += this.distanceInKM(this.path[i], this.path[i + 1]);
    	}// for
    	return distance;
    },
    // adding a point to the route
    pushPoint: function(point){
    	this.path.push(point);
    },
    // returns the path
    getPath: function(){ return this.path;},
    // empties the path
    emptyPath: function(){this.path = [];}
};

$(document).ready(function() {

	initialize();
});

/************************************************************************
*   name:  initalization
*   desc:  responsible for the initalization process and the UI / logic
*************************************************************************
*   in:   none  
*************************************************************************
*   out:   void
*************************************************************************
*/
function initialize() {
	var mapOptions = {
		  center: new google.maps.LatLng(37.7833,-122.4167), // setting the map in beautiful SF
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

		if (g_turn < 3){ // 1st player turn
			current_driver = 1;
			current_driver_obj = g_first_driver;
		}// if
		else if (g_turn > 2 && g_turn < 5){ // 2nd player turn
			current_driver = 2;
			current_driver_obj = g_second_driver;
		}// else
		

		g_turn++; // moving on to the next turn

		if (current_driver){ // there is a player, we're still in a new session
			msg_elements = $('.lyft > .container > span');
			$('#msg-' + g_turn).removeClass('hide');
			msg_elements.not('#msg-' + g_turn).addClass('hide');

			temp = createDriverMarker(e.latLng,current_driver);
			
			if (temp) {g_routes.push(temp);} // pushing the marker to the routes array, for later removal reference
			
			current_driver_obj.pushPoint(new Point(e.latLng )); // adding point to the route

			if (current_driver_obj.getLen() > 1){
				temp = drawRoute(current_driver_obj.getPath(),current_driver); // pushing polyline to the routes array for later removal reference

				if (temp) {g_routes.push(temp);}
			}// if - getLen

		}// if - current_driver

		// displaying calculation
		if (g_turn === 5){
			setTimeout(function(){
				var shortest = calcDetour(g_first_driver,g_second_driver),
					msg_elements;

				msg_elements = $('.lyft > .container > span');
				msg_elements.addClass('hide');
				$('#msg-result').removeClass('hide').text(shortest.first < shortest.second ? '1st' : '2nd' );
			},400);
		}// if - g_turn

	});
	
	$('button.btn-lyft').click(reset);
}

/************************************************************************
*   name:  emptyPolylineRoutes
*   desc:  removing object off the map
*************************************************************************
*   in:   none  
*************************************************************************
*   out:   void
*************************************************************************
*/
function emptyPolylineRoutes(){
	var i,
		len = g_routes.length;

	for(i = 0; i < len; i++){
		g_routes[i].setMap(null);
	}

	g_routes = [];
}
/************************************************************************
*   name:  reset
*   desc:  resetting the session, removing objs off the map and turns
*************************************************************************
*   in:   none  
*************************************************************************
*   out:   void
*************************************************************************
*/
function reset(){

	g_first_driver.emptyPath();
	g_second_driver.emptyPath();

	g_turn = 1;


	emptyPolylineRoutes();
	// UI changes
	$('span[id*="msg-"]').not('.hide').addClass('hide');
	$('#msg-1').removeClass('hide');
}
/************************************************************************
*   name:  calcDetour
*   desc:  calculating the distances between 4 points in 2 different combinations
*		   according to the instruction the direction is A->B and C->D
*************************************************************************
*   in:   route_first, route_second  - Route  
*************************************************************************
*   out:   Object 
*************************************************************************
*/
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
		first: dist_A_C + route_first.routeDistance() + dist_D_B, // first driver A->B
		second:  dist_A_C + route_second.routeDistance() + dist_D_B// second driver C->D
	}

}
/************************************************************************
*   name:  addMarker
*   desc:  adding a custom marker, adding a prefixed shadow points is optional
*************************************************************************
*   in:   marker obj - Obj , make_shadow - BOOL  
*************************************************************************
*   out:   Google.maps.Marker
*************************************************************************
*/
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
/************************************************************************
*   name:  drawRoute
*   desc:  drawing a polyline based on the route and driver_id for choosing
* 		   the predefined marker
*************************************************************************
*   in:   route - Array of Points, driver_id = INT  
*************************************************************************
*   out:   Google.maps.Polyline
*************************************************************************
*/
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
/************************************************************************
*   name:  createDriverMarker
*   desc:  predefines the custom marker settings, calls addMarker for adding 
*		   the marker to the map
*************************************************************************
*   in:   position -Google.maps.LatLng, driver_id - INT  
*************************************************************************
*   out:   Google.maps.Marker
*************************************************************************
*/
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
