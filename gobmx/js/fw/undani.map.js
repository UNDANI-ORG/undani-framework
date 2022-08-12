"use strict";
(function ($) {
    //uMap regresa una promesa en donde la respuesta de esta es la/las instancias de uMap.
    $.fn.uMap = function (oSettings) {
        var $selector = this;
        var instances = [];
        var _readOnly;

        oSettings = $.extend({
            latitud: 19.4361609,
            longitud: -99.1373136,
            zoom: 18
        }, oSettings || {});

        function addReferenceScript() {
            const m = $.Deferred();
            if (window.google && window.google.maps) {
                return m.resolve();
            }
            setTimeout(function () {
                $.getScript(GlobalSetting.GoogleApi.Rute).done(function (script, textStatus) {
                    console.log("Registro de script de Maps correctamente");
                    m.resolve();
                })
                    .fail(function (jqxhr, settings, exception) {
                        m.reject();
                    });
            }, 200);
            return m.promise();
        }

        function createInstances() {
            $selector.each(function () {
                var $this = renderMap(this);
                instances.push($this);
            });
            return instances;
        }

        return addReferenceScript().then(createInstances);

        function renderMap(element) {
            var marker;
            var $element = $(element);

            $element.addClass("fixmap");

            // Crea el mapa de google, usando la configuración.
            var mapOptions = {
                center: { lat: parseFloat(oSettings.latitud), lng: parseFloat(oSettings.longitud) },
                zoom: oSettings.zoom,
                draggable: true
            };

            var map = new google.maps.Map(element, mapOptions);

            addMarker(new google.maps.LatLng(oSettings.latitud, oSettings.longitud));

            google.maps.event.addListener(map, "click", function (event) {
                if (_readOnly) return;
                erraseMarker();
                var geocoder = new google.maps.Geocoder();
                geocode(geocoder, map, null, event.latLng, true);
            });

            function erraseMarker() {
                marker.setMap(null);
            }

            function addMarker(location) {
                marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    animation: google.maps.Animation.DROP
                });
                map.panTo(location);
                google.maps.event.addListener(marker, "click", toggleBounce, function () {
                    showInfoWindow();
                });
            }

            //Se envia la dirección o coordenadas al trigger 
            function sendAddressF(address) {
                $element.trigger("mapClick", [address]);
            }

            //Se muestra la información del Marker (Customizada).
            function showInfoWindow(location) {
                var html = "";
                var pos = marker.getPosition();
                window.location.hash = `#${pos.lat()},${pos.lng()}`;
                html += `<b>Dirección:</b> ${location} <br>`;
                html += `<br><small><i class="ti ti-location-pin"></i> <b>Latitud:</b> ${pos.lat().toString().substr(0, 10)} &nbsp;&nbsp;&nbsp; <b>Longitud:</b> ${pos.lng().toString().substr(0, 10)}</small><br>`;
                map.panTo(pos);
                var infowindow = new google.maps.InfoWindow({
                    content: `<div id='iw' style='max-width:250px;color:#000'>${html}</div>`
                });
                infowindow.open(map, marker);
            }

            //Efecto para animación de brincar en el marker.
            function toggleBounce() {
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            }

            function setPosition(latitud, longitud, direccion, readOnly) {
                _readOnly = readOnly;
                erraseMarker();
                var geocoder = new google.maps.Geocoder();
                var mapsLatLng;

                if (navigator.geolocation && latitud === "" && longitud === "" && direccion === "" || direccion === ", , , , ") {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        latitud = position.coords.latitude;
                        longitud = position.coords.longitude;

                        mapsLatLng = new google.maps.LatLng(latitud, longitud);
                        geocode(geocoder, map, null, mapsLatLng, true);
                    }, function () {
                        if (latitud === "") latitud = "19.4361609";
                        if (longitud === "") longitud = "-99.1373136";

                        mapsLatLng = new google.maps.LatLng(latitud, longitud);
                        geocode(geocoder, map, null, mapsLatLng, false);
                    });
                } else {
                    var mapsLatLng = new google.maps.LatLng();
                    let sendAddress = false;
                    if (direccion === "" || direccion === ", , , , ") {
                        direccion = null;
                        sendAddress = true;
                        var mapsLatLng = new google.maps.LatLng(latitud, longitud);
                    }
                    geocode(geocoder, map, direccion, mapsLatLng, sendAddress);
                }
            }

            function geocode(geocoder, resultsMap, address, latLng, sendAddress) {
                geocoder.geocode({
                    'address': address,
                    'location': latLng
                }, function (results, status) {
                    if (status === "OK") {
                        if (results[0]) {
                            map.setZoom(18);
                            resultsMap.setCenter(results[0].geometry.location);
                            addMarker(results[0].geometry.location);
                            showInfoWindow(results[0].formatted_address);

                            if (address !== null) {
                                var pos = marker.getPosition();
                                var position = {
                                    latitud: pos.lat().toString().substr(0, 10),
                                    longitud: pos.lng().toString().substr(0, 10)
                                };
                                $element.trigger("mapClick", [position]);
                            }
                            if (sendAddress) sendAddressF(results[0].address_components);
                        } else {
                            window.alert("No se encontraron resultados con la dirección, intente nuevamente.");
                        }
                    } else {
                        window.alert("No se encontraron resultados con la dirección, ingrese más datos y vuelva a intentar.");
                    }
                });
            }

            function getPosition() {
                var position = {
                    latitud: marker.getPosition().lat(),
                    longitud: marker.getPosition().lng()
                };
                return position;
            }

            $element = $.extend($element, {
                setPosition: setPosition,
                getPosition: getPosition,
                erraseMarker: erraseMarker
            });

            return $element;
        }
    };
})(jQuery);