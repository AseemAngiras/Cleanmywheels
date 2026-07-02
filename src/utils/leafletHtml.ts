export const getLeafletHtml = (initialLat: number, initialLong: number) => `
<!DOCTYPE html>
<html>
<head>
    <title>Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
        .leaflet-bottom.leaflet-right {
            bottom: 100px; /* Lift above Confirm/Cancel buttons */
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: false
        }).setView([${initialLat}, ${initialLong}], 16);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var marker = L.marker([${initialLat}, ${initialLong}], {draggable: false}).addTo(map);

        function log(msg) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'log',
                    payload: msg
                }));
            }
        }

        function updateLocation(lat, lng) {
            log("Updating location to: " + lat + ", " + lng);
            var newLatLng = new L.LatLng(lat, lng);
            marker.setLatLng(newLatLng);
            map.setView(newLatLng, 16);
        }

        /* 
           Removed moveend listener. 
           User wants "tap to place" behavior, not "center pin" behavior.
           Marker should only move when tapped or explicitly updated.
        */


        map.on('click', function(e) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            log("Map clicked at: " + lat + ", " + lng);
            marker.setLatLng([lat, lng]);
            // Send new coordinates back to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    payload: {
                        lat: lat,
                        lng: lng
                    }
                }));
            }
        });

        // Listen for messages from React Native
        document.addEventListener("message", function(event) {
            handleMessage(event.data);
        });
        
        window.addEventListener("message", function(event) {
            handleMessage(event.data);
        });

        function handleMessage(data) {
            try {
                log("Received message in WebView: " + data);
                var message = JSON.parse(data);
                if (message.type === 'updateLocation') {
                    updateLocation(message.payload.lat, message.payload.lng);
                }
            } catch (e) {
                 log("Error parsing message: " + e);
            }
        }
    </script>
</body>
</html>
`;
