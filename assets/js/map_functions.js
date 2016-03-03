function bindInfoWindow(marker, map, infowindow, html, brew, bar, what) {

    marker.addListener('click', function(e) {
        var i = 0
        var string = [];
        infowindow.setContent(html);
        infowindow.open(map, this);

        if (what === "brews") {

            beers.forEach(function(beer) {
                var beer_id = parseInt(beer.brew);
                id = parseInt(brew.id);
                if (beer_id === id) {
                    string[i] = beer.name;
                    i++
                } //beer_id
            });

            contacto = JSON.parse(brew.contacto);
            $("#info_name").html("<h4>Nombre: </h4>" + brew.name);
            $("#info_cervezas").html("<h4>Crevezas</h4><hr>" + string);

            if (jQuery.isEmptyObject(contacto)|| bar.contacto === null || bar.contacto === "") {
                $("#info_contacto").html("<h4>Contacto:</h4>No hay contacto sobre esta Cerveceria. Si estan interesados en dar mas información favor de contactarse con nosotros a: <br><strong> contacto@bcbeermap.com</strong><br>");
            } else {
                $("#info_contacto").html("<h4>Contacto: </h4><a href=" + contacto.facebook + " >" + contacto.facebook + "</a><br>" + contacto.phone);
            }
            if(brew.logo !== ""){
                $("#logo").html("<h4>Logo:</h4><img style='height: 100px; width: auto;' src="+ brew.logo +">");
            } else {
                $("#logo").html("<h4>Logo:</h4>No hay logo para esta cerveceria. Si estan interesados mostrarlo favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
            }

        } //if brews
        else if (what === "bar") {
            if (typeof bar.beers[0] !== 'undefined') {
                bar.beers.forEach(function(beer_id) {
                    if (beers[beer_id]) {
                        string[i] = beers[beer_id].name;
                    }
                    i++;
                });

                if (jQuery.isEmptyObject(bar.contacto) || bar.contacto === null || bar.contacto === "") {
                    contacto = "No hay contacto sobre este bar. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>";
                } else {
                    contacto = JSON.parse(bar.contacto);
                    contacto = "<a href='"+ contacto.facebook +"'>" + contacto.facebook + "</a>";
                }

                $("#info_name").html("<h4>Nombre: </h4>" + bar.name);
                $("#logo").html("<h4>Logo:</h4><img style='height: 100px; width: auto;' src="+ brew.logo +">");
                $("#info_contacto").html("<h4>Contacto: </h4>" + contacto + "<br>");
                $("#info_cervezas").html("<h4>Crevezas</h4><hr>" + string);

            } //iftypeof
            else {
                if (jQuery.isEmptyObject(bar.contacto) || bar.contacto === null || bar.contacto === "") {
                    $("#info_contacto").html("<h4>Contacto: </h4> No hay contacto sobre este bar. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
                } else
                    $("#info_contacto").html("<h4>Contacto: </h4><a href=" + JSON.parse(bar.contacto) + ">" + JSON.parse(bar.contacto) + "</a><br>");


                $("#info_name").html("<h4>Nombre: </h4>" + bar.name);
                $("#info_cervezas").html("<h4>Crevezas</h4><hr> No hay informacion sobre las cervezas de esta cerveceria. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
            }
        } //ifbar

    });
} //bindInfoWindow


function routeToPlace(marker, directionsDisplay) {
    marker.addListener('dblclick', function(e) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var request = {
                destination: e.latLng,
                origin: geolocate,
                travelMode: google.maps.TravelMode.DRIVING
            };

            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Display the route on the map.
                    directionsDisplay.setDirections(response);
                } //if status
            }); //directionService
        }); //navigator
    }); //marker.addlistener
} // routToPlace(marker)


function searchMarker(brews, bars, beers, all_markers, infowindow)
{

    var i = 0;
    var input = $('#search').val().toLowerCase();
    var temp = [];
    var temp2 = [];
    var all_names = [];
    var search_results = [];
    beers.forEach(function (beer){
        all_names[i] = { name:beer.name.toLowerCase(), type:"cheves", brew: parseInt(beer.brew)};
        brews.forEach(function (brew){
            if(all_names[i].brew === brew.id)
                all_names[i].brew = brew.name.toLowerCase();
        });

        i++;
    });

    brews.forEach(function (brew){
        all_names[i] = { name:brew.name.toLowerCase(), type:"cervecerias"};
        i++;
    });

    bars.forEach(function (bar){

        if(typeof bar.beers[0] !== 'undefined' ){
            
            beers.forEach(function (beer){
                for(var z =0; z<bar.beers.length; z++){
                    if(bar.beers[z] === beer.id){
                        temp.push(beer.name.toLowerCase());
                        if(typeof temp2 !== 'undefined' ){
                            brews.forEach(function (brew){
                                if(Number(beer.brew) === brew.id)
                                    temp2.push(brew.name.toLowerCase());
                            });
                        }
                            
                    }
                }
            });
            
            all_names[i] = { name:bar.name.toLowerCase(), type:"bares", beers: temp.join(" "), brew: temp2.join(" ") };
            
        } else {
            all_names[i] = { name:bar.name.toLowerCase(), type:"bares", beers: "", brew: temp2.join(" ") }; 
        }
        temp = [];
        temp2 = [];
        i++;
    });

   for(var i=0; i<all_names.length; i++) 
        for(key in all_names[i]) 
            if(all_names[i][key].indexOf(input)!=-1) {
                
                search_results.push(all_names[i]);
            }

    keepMarkers(search_results, all_markers, infowindow);

     $('#search').keydown(function(e){
        if(e.keyCode == 8) {
            var y = 0;
            var length = all_markers.length;
            for(var i=0; i<length; i++){
            for(var x=0; x<search_results.length; x++){
                if(all_markers[i].title.toLowerCase() === search_results[x].brew){
                    y++;
                }     
            }
            if(y !== 0)
                all_markers[i].setVisible(true);
            y=0;
            //console.log(markers[i].title);   
        }
        }
    });
    
    
}//searchMarker

function clearSearch(all_markers, map, infowindow)
{
   $('#search').val("");
   for (var i = 0; i < all_markers.length; i++) {
        all_markers[i].setVisible(true);
    }

}


function keepMarkers(res, markers, infowindow){
    var y = 0;

    if(typeof res[0] === 'undefined' || $('#search').val() == ""){
        $("#info_cervezas").html("<p> No hay resultados sobre su busqueda. Si cree que es un error o una nueva cerveceria / bar / tienda que se quiere unir a nosotros favor de mandar correo a:<br> <strong> contacto@bcbeermap.com</strong>");
        for (var i = 0; i < all_markers.length; i++) {
            all_markers[i].setVisible(true);

        }
    }
    else {
        var length = markers.length;
        for(var i=0; i<length; i++){
            for(var x=0; x<res.length; x++){
                if(markers[i].title.toLowerCase() === res[x].brew || markers[i].title.toLowerCase() === res[x].name ){
                    y++;
                }     
            }
            if(y === 0){
                markers[i].setVisible(false);
            }
                
            y=0;
        }
    }
}   
