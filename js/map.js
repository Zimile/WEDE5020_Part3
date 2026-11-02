/* =========================================================
   Timmy's Yummy Bakes - interactive map (Leaflet + OpenStreetMap)
   To move the market stall pin: right-click the exact spot in
   Google Maps, copy the "lat, lng" numbers and paste them below.
   ========================================================= */

(function () {
    "use strict";

    var MARKET_STALL = {
        name: "Weekend Market Stall",
        address: "Ermelo Taxi Rank, Ermelo CBD, Ermelo, Mpumalanga, 2350",
        details: "Open on weekends. Collect your pre-order or buy fresh treats on the day.",
        lat: -26.5201,
        lng: 29.9862
    };

    // The home kitchen is shown as an area, not a pin, to protect the owner's privacy
    var PICKUP_AREA = {
        name: "Home Kitchen Pickup Area",
        details: "Collection by appointment in Ermelo. The exact address is shared when your order is confirmed.",
        lat: -26.5201,
        lng: 29.9862,
        radius: 2000
    };

    function directionsUrl(place) {
        return "https://www.google.com/maps/dir/?api=1&destination=" + place.lat + "," + place.lng;
    }

    function popupHtml(place) {
        return '<h3>' + place.name + '</h3>' +
            '<p>' + place.address + '</p>' +
            '<p>' + place.details + '</p>' +
            '<a href="' + directionsUrl(place) + '" target="_blank" rel="noopener">Get directions &#8599;</a>';
    }

    document.addEventListener("DOMContentLoaded", function () {
        var el = document.getElementById("map");
        if (!el) return;

        // If the Leaflet CDN is unreachable, show a useful fallback instead of an empty box
        if (typeof L === "undefined") {
            el.innerHTML = '<div class="map-fallback"><p>The interactive map could not load. ' +
                'Our weekend market stall is at the <strong>Ermelo Taxi Rank</strong>.</p>' +
                '<a href="' + directionsUrl(MARKET_STALL) + '" target="_blank" rel="noopener">Open in Google Maps</a></div>';
            return;
        }

        var map = L.map(el, {
            scrollWheelZoom: false, // avoid hijacking page scroll until the visitor engages
            tap: true
        }).setView([MARKET_STALL.lat, MARKET_STALL.lng], 14);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Custom brand-coloured pin
        var pin = L.divIcon({
            className: "",
            html: '<span class="map-pin" aria-hidden="true"></span>',
            iconSize: [36, 36],
            iconAnchor: [18, 43],
            popupAnchor: [0, -40]
        });

        var marker = L.marker([MARKET_STALL.lat, MARKET_STALL.lng], {
            icon: pin,
            title: MARKET_STALL.name,
            alt: MARKET_STALL.name + " map pin",
            keyboard: true
        }).addTo(map).bindPopup(popupHtml(MARKET_STALL));

        var area = L.circle([PICKUP_AREA.lat, PICKUP_AREA.lng], {
            radius: PICKUP_AREA.radius,
            color: "#6b3e26",
            weight: 2,
            fillColor: "#d99b72",
            fillOpacity: 0.15
        }).addTo(map).bindPopup('<h3>' + PICKUP_AREA.name + '</h3><p>' + PICKUP_AREA.details + '</p>');

        marker.openPopup();

        // Scroll-wheel zoom only while the map is in use
        map.on("focus click", function () { map.scrollWheelZoom.enable(); });
        map.on("blur mouseout", function () { map.scrollWheelZoom.disable(); });

        // Location card buttons fly the map to each place
        document.querySelectorAll("[data-map-target]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var target = btn.dataset.mapTarget;
                if (target === "market") {
                    map.flyTo(marker.getLatLng(), 16);
                    marker.openPopup();
                } else if (target === "area") {
                    map.flyToBounds(area.getBounds());
                    area.openPopup();
                } else {
                    map.flyTo([MARKET_STALL.lat, MARKET_STALL.lng], 14);
                }
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        });

        // Leaflet measures its container on load; re-measure if the layout changes
        window.addEventListener("resize", function () { map.invalidateSize(); });
    });
})();
