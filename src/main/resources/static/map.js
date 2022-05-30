let markers = [];
let map = null;
let start = null;
let end = null;
let directionsService = null;
let directionsDisplay = null;

function clearOldMarkers() {
    // Clear out the old markers.
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
}

function addMarker(position) {
    if (map !== null && (markers.length != 1 || markers[0].position.lat() != position.lat || markers[0].position.lng() != position.lng || map.getZoom() != position.zoom)) {
        map.setCenter({"lat": position.lat, "lng": position.lng});
        map.setZoom(position.zoom);
        clearOldMarkers();
        const icon = {
            url: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
        };
        markers.push(
            new google.maps.Marker({
                map,
                icon,
                position: {"lat": position.lat, "lng": position.lng}
            })
        );
    }
}

function calcRoute(startPosition) {
    clearOldMarkers();
    start = startPosition;
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsDisplay.setMap(null);
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);
        } else {
            alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
        }
    });
}

// Initialize and add the map
function initAutocomplete() {
    end = new google.maps.LatLng(49.203691381047534, -122.91278600692749); // Douglas College
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: end,
        mapTypeId: "roadmap"
    });
    addMarker({"lat": end.lat(), "lng": end.lng(), "zoom": 16});
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    // Create the search box and link it to the UI element.
    const input = document.getElementById("search-box");
    const searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    map.addListener('click', (e) => {
        //addMarker({"lat": e.latLng.lat(), "lng": e.latLng.lng(), "zoom": map.getZoom()});
        calcRoute({"lat": e.latLng.lat(), "lng": e.latLng.lng()});
        syncPosition();
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        clearOldMarkers();

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            /*markers.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                })
            );*/

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            calcRoute({"lat": place.geometry.location.lat(), "lng": place.geometry.location.lng()});
        });
        bounds.extend(end);
        map.fitBounds(bounds);
        syncPosition();
    });
}

window.initAutocomplete = initAutocomplete;