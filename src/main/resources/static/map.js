let map = null;
let directionsService = null;
let directionsDisplay = null;
let startPosition = null;
let startMarker = null;
let endPosition = null;
let endMarker = null;

function addMarker(position, label) {
    if (map !== null) {
        map.setCenter({"lat": position.lat, "lng": position.lng});
        if (position.zoom) {
            map.setZoom(position.zoom);
        }
        // const icon = {
        //     url: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
        //     size: new google.maps.Size(71, 71),
        //     origin: new google.maps.Point(0, 0),
        //     anchor: new google.maps.Point(17, 34),
        //     scaledSize: new google.maps.Size(25, 25),
        // };
        return new google.maps.Marker({
            map,
            //icon,
            label: {
                text: label,
                color: 'white'
            },
            position: {"lat": position.lat, "lng": position.lng}
        });
    }
    return null;
}

function calcRoute() {
    if (startPosition && endPosition) {
        const request = {
            origin: startPosition,
            destination: endPosition,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsDisplay.setMap(null);
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                directionsDisplay.setMap(map);
            } else {
                alert("Directions Request from " + startPosition.toUrlValue(6) + " to " + endPosition.toUrlValue(6) + " failed: " + status);
            }
        });
    } else {
        directionsDisplay.setMap(null);
    }
}

function addStartMarker() {
    startMarker = addMarker({"lat": startPosition.lat(), "lng": startPosition.lng()}, 'A');
    startMarker.addListener("click", () => {
        removeStartMarker();
        calcRoute();
        notifyChanged(getMapContent());
    });
}

function removeStartMarker() {
    startPosition = null;
    startMarker.setMap(null);
    startMarker = null;
}

function addEndMarker() {
    endMarker = addMarker({"lat": endPosition.lat(), "lng": endPosition.lng()}, 'B');
    endMarker.addListener("click", () => {
        removeEndMarker();
        calcRoute();
        notifyChanged(getMapContent());
    });
}

function removeEndMarker() {
    endPosition = null;
    endMarker.setMap(null);
    endMarker = null;
}

function syncMap(mapContent) {
    if (mapContent != null) {
        if (startPosition != null) {
            removeStartMarker();
        }
        if (endPosition != null) {
            removeEndMarker();
        }
        if (mapContent.startPosition != null) {
            startPosition = new google.maps.LatLng(mapContent.startPosition.lat, mapContent.startPosition.lng);
            addStartMarker();
        }
        if (mapContent.endPosition != null) {
            endPosition = new google.maps.LatLng(mapContent.endPosition.lat, mapContent.endPosition.lng);
            addEndMarker();
        }
        calcRoute();
    }
}

function getMapContent() {
    let content = null;
    if (startPosition != null) {
        if (endPosition != null) {
            content = {
                "startPosition": {"lat": startPosition.lat(), "lng": startPosition.lng()},
                "endPosition": {"lat": endPosition.lat(), "lng": endPosition.lng()}
            };
        } else {
            content = {
                "startPosition": {"lat": startPosition.lat(), "lng": startPosition.lng()},
                "endPosition": null
            };
        }
    } else {
        if (endPosition != null) {
            content = {
                "startPosition": null,
                "endPosition": {"lat": endPosition.lat(), "lng": endPosition.lng()}
            };
        } else {
            content = {
                "startPosition": null,
                "endPosition": null
            };
        }
    }
    return content;
}

function clickMap(e) {
    if (startMarker == null) {
        startPosition = e;
        addStartMarker();
        calcRoute();
        notifyChanged(getMapContent());
    } else if (endMarker == null) {
        endPosition = e;
        addEndMarker();
        calcRoute();
        notifyChanged(getMapContent());
    }
}

// Initialize and add the map
function initMap() {
    endPosition = new google.maps.LatLng(49.203691381047534, -122.91278600692749); // Douglas College
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: endPosition,
        mapTypeId: "roadmap"
    });
    addEndMarker();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    // Create the search box and link it to the UI element.
    const input = document.getElementById("search-box");
    const searchBox = new google.maps.places.SearchBox(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });
    map.addListener('click', (e) => {
        clickMap(e.latLng);
    });
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
            clickMap(place.geometry.location);
        });
        if (startPosition != null && endPosition != null) {
            bounds.extend(startPosition);
            bounds.extend(endPosition);
        }
        map.fitBounds(bounds);
    });
}
window.initMap = initMap;