const JILF = {lat: 40.0374771, lng: -74.2339456};

/**
 * @description ViewModel
 * @param {Object} map - Google Maps Map object
 * @param {Object[]} locations - Array of Google Maps PlaceResult objects
 */
function ViewModel(map, locations) {
    let self = this;
    
    self.map = map;
    self.geocoder = new google.maps.Geocoder();
    self.bounds = new google.maps.LatLngBounds();
    self.infoWindow = new google.maps.InfoWindow({
        maxWidth: 200
    });
    self.places = [];
    locations.forEach(function(place) {
        self.places.push(place);
    });

    // Knockout observables
    self.isOpen = ko.observable(false);
    self.userInput = ko.observable("");
    self.placesList = ko.observableArray();
    self.places.forEach(function(place) {
        self.placesList.push(place);
    });


    // Create markers
    self.places.forEach(function(place) {
        let marker = new google.maps.Marker({
            map: self.map,
            position: place.geometry.location
        });
    
        place.marker = marker;

        // Extend bounds of map
        self.bounds.extend(marker.position);
    
        // Add click-event to markers
        google.maps.event.addListener(marker, 'click', function() {
            self.showInfoWindow(place);
        });
    });


    // Re-center map based on markers
    map.setCenter(self.bounds.getCenter());
    map.fitBounds(self.bounds); 


    /** 
     * @description Filter marker results
    */
    self.filterResults = function() {
        let input = self.userInput().toLowerCase();

        self.places.forEach(function(place) {
            if (place.name.toLowerCase().includes(input)) {
                if (self.placesList().includes(place) === false) {
                    self.placesList.push(place);
                    place.marker.setMap(map);
                }
            } else {
                self.placesList.remove(place);
                place.marker.setMap(null);
            }
        });
    };


    /**
     * @description Show infoWindow
     * @param {Object} place - Google Maps PlaceResult object
     */
    self.showInfoWindow = function(place) {
        let info = '<h1>' + place.name + '</h1>';
        let pendingInfo = '<p>Pending search...</p>';

        // Open infoWindow
        self.infoWindow.setContent(info + pendingInfo);
        self.infoWindow.open(map, place.marker);
        
        // Get formatted address from latlng coordinates
        // https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse
        self.geocoder.geocode({'location': place.geometry.location}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    info += results[0].formatted_address;
                } else {
                    window.alert('No address found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
        });

        // Marker animation
        // https://stackoverflow.com/questions/7339200/bounce-a-pin-in-google-maps-once
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            place.marker.setAnimation(null);
        }, 1400);

        // Re-center map on marker using panTo for smooth transition
        map.panTo(place.geometry.location);


        // Wikipedia (MediaWiki) AJAX request
        let wikiUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&list=search&srsearch=' + encodeURIComponent(place.name);

        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp'
        })
        .done(function(data) {
            if (data.query.search[0]) {
                // Save first article (which should be most relevant)
                let wikiArticleInfo = data.query.search[0];
                if (wikiArticleInfo.title) {
                    let title = wikiArticleInfo.title;
                    info += '<h4>Related Wikipedia Article:</h4>';
                    info += '<p><a href="https://en.wikipedia.org/wiki/' + title + '">' + title + '</a></p>';
                }
            } else {
                // Request succeeded, but no articles were found
                info += '<p>No Wikipedia articles found!</p>';
            }

            // Update content of infoWindow
            self.infoWindow.setContent(info);
        })
        .fail(function() {
            info += '<p>Failed to get Wikipedia resources</p>';
            self.infoWindow.setContent(info);
        }); 
    };


    /**
     * @description Toggle the sidebar
     * https://stackoverflow.com/questions/23385937/knockout-toggle-active-class-on-click
     */
    self.toggleOpen = function() {
        self.isOpen(!self.isOpen());
    } 
}


/** 
 * @description Google Maps API
*/
function initMap() {
    let map = new google.maps.Map(document.getElementById('map'), {
        center: JILF,
        zoom: 13
    });

    // Prepopulate map with data from Nearby Search
    // This search identifies banks local to Jesus is Lord Fellowship Church
    // https://developers.google.com/maps/documentation/javascript/examples/place-search
    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: JILF,
        radius: 5000,
        type: ['bank']
    }, placesCallback);

    // https://developers.google.com/maps/documentation/javascript/examples/place-search
    function placesCallback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // If locations were retrieved correctly, load application
            //https://stackoverflow.com/questions/32899466/using-knockout-js-and-google-maps-api
            ko.applyBindings(new ViewModel(map, results)); 
        } else {
            window.alert('Failed to retrieve map locations');
        }
    }
}

/**
 * @description Google Maps API Error Handler
 */
function googleMapsError() {
    window.alert('Failed to load Google Maps API');
}
