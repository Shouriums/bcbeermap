var map
var directionsDisplay = "";
var infowindow = "";
    
    function initMap() {
        var i = 0;
        var myLatLng = {
            lat: 32.624535,
            lng: -115.452180
        };

        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 32.624535,
                lng: -115.452180
            },
            scrollwheel: true,
            zoom: 12
        });

        var directionsDisplay = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true
        });

        var infowindow = new google.maps.InfoWindow();

        brews.forEach(function(brew) {
            if (brew.geo !== "" && brew.geo !== null) {
                var contentString = "<strong>" + brew.name + " </strong>";

                brew.geo = brew.geo.replace('lon', 'lng');
                var marker = new google.maps.Marker({
                    map: map,
                    icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                    position: JSON.parse(brew.geo),
                    title: brew.name
                });
                all_markers.push(marker);
                bindInfoWindow(marker, map, infowindow, contentString, brew, "", "brews", brews, bars);
                routeToPlace(marker, directionsDisplay);

            } // if bar geo
        }); //forEach

        bars.forEach(function(bar) {
            if (bar.geo !== "" && bar.geo !== "{}" && bar.geo !== null) {
                var contentString = "<strong>"+ bar.name + "</strong>" ;

                infowindow.setContent(contentString);
                bar.geo = bar.geo.replace('lon', 'lng');
                var marker = new google.maps.Marker({
                    map: map,
                    icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                    position: JSON.parse(bar.geo),
                    title: bar.name
                });
                all_markers.push(marker);
                if (typeof bar.beers[0] === 'undefined') {
                    marker.setZIndex(-10);
                }
                bindInfoWindow(marker, map, infowindow, contentString, "", bar, "bar", brews, bars);
                routeToPlace(marker, directionsDisplay);
            } // if bar geo
        }); //forEach

        $("#clear").click(function(){
            clearSearch(all_markers, map, directionsDisplay);
        });

        $("#search").keyup(function (){

            searchMarker(brews, bars, beers, all_markers, infowindow)
        });

        $("#search").select(function (){
            for (var i = 0; i < all_markers.length; i++) {
                all_markers[i].setVisible(true);
            }
        });

         navigator.geolocation.getCurrentPosition(function(position) {
            var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var infowindow2 = new google.maps.InfoWindow();
            infowindow2.setContent("Aqui Estoy");
            var marker2 = new google.maps.Marker({
                map: map,
                icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                position: geolocate,
                title: "Aqui Estoy"
            });

            marker2.addListener('mouseover', function() {
                infowindow2.open(map, marker2);
            });
            marker2.addListener('mouseout', function() {
                infowindow2.close();
            });
        });


    } //initMap


function bindInfoWindow(marker, map, infowindow, html, brew, bar, what, all_brews, all_bars) {

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
                    string[i] = beer;
                    i++
                } //beer_id
            });

            contacto = JSON.parse(brew.contacto);
            $("#info_name").html("<h2>"+ brew.name +"</h2>");
            $("#info_cervezas").html("<h4 style='text-align:left; float:left;'>Cervezas  </h4>  <h6 style=' float:left; margin-top: 1.3%; margin-left:1%'>(dar click en los logos para ver mas información)</h6><br><hr>");
            

            if (jQuery.isEmptyObject(contacto)|| contacto === null || contacto === "") {
                $("#info_contacto").html("<h4>Contacto:</h4>No hay contacto sobre esta Cerveceria. Si estan interesados en dar mas información favor de contactarse con nosotros a: <br><strong> contacto@bcbeermap.com</strong><br>");
            } else {
                $("#info_contacto").html("<h4>Contacto: </h4><a href=" + contacto.facebook + " >" + contacto.facebook + "</a><br>" + contacto.phone);
            }
            if(brew.logo !== ""){
                $("#logo").html("<img class='img-rounded' style='height: 100px; width: auto;' src="+ brew.logo +">");
            } else {
                $("#logo").html("<img style='height: 50px; width: auto;' src='../assets/img/bcbeermap.png'><br><i>No hay logo para esta cerveceria. Si estan interesados mostrarlo favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</i></strong>");
            }
            infoCervezas(string, what);
        } //if brews
        else if (what === "bar") {
            if (typeof bar.beers[0] !== 'undefined') {
                bar.beers.forEach(function(beer_id) {
                    if (beers[beer_id]) {
                        all_brews.forEach(function (b){
                            if(b.id === parseInt(beers[beer_id].brew))
                                beers[beer_id].brewName = b.name;
                        });

                        string[i] = beers[beer_id];      
                    }
                    i++;
                });

                if (jQuery.isEmptyObject(bar.contacto) || bar.contacto === null || bar.contacto === "") {
                    contacto = "No hay contacto sobre este bar. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>";
                } else {
                    contacto = JSON.parse(bar.contacto);
                    contacto = "<a href='"+ contacto.facebook +"'>" + contacto.facebook + "</a>";
                }

                $("#info_name").html("<h2>"+ bar.name +"</h2>");
                $("#logo").html("<img style='height: 50px; width: auto;' src='../assets/img/bcbeermap.png'><br>No hay logo para este bar. Si estan interesados mostrarlo favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
                $("#info_contacto").html("<h4>Contacto: </h4>" + contacto + "<br>");
                $("#info_cervezas").html("<h4>Crevezas</h4><hr>");
            } //iftypeof
            else {
                if (jQuery.isEmptyObject(bar.contacto) || bar.contacto === null || bar.contacto === "") {
                    $("#info_contacto").html("<h4>Contacto: </h4> No hay contacto sobre este bar. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
                } else
                    $("#info_contacto").html("<h4>Contacto: </h4><a href=" + JSON.parse(bar.contacto) + ">" + JSON.parse(bar.contacto) + "</a><br>");


                $("#info_name").html("<h2>Nombre: </h2>" + bar.name);
                $("#logo").html("<img style='height: 50px; width: auto;' src='../assets/img/bcbeermap.png'><br>No hay logo para este bar. Si estan interesados mostrarlo favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
                $("#info_cervezas").html("<h4>Crevezas</h4><hr> No hay informacion sobre las cervezas de esta cerveceria. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>");
            }
            infoCervezas(string, what);
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
    var temp3 = [];
    var all_names = [];
    var search_results = [];
    infowindow.close();
    beers.forEach(function (beer){
        beer.type.toString();
        if(typeof beer.type !== 'object')
            all_names[i] = { name:beer.name.toLowerCase(), type:"cheves", brew: parseInt(beer.brew), style:beer.type.toLowerCase()};
        else
            all_names[i] = { name:beer.name.toLowerCase(), type:"cheves", brew: parseInt(beer.brew), style: "" };
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
                        if(typeof beer.type !== 'object')
                                temp3.push(beer.type.toLowerCase());
                            else
                                temp3.push("");
                            if(typeof temp2 !== 'undefined' ){ 
                                brews.forEach(function (brew){
                                    if(Number(beer.brew) === brew.id)
                                        temp2.push(brew.name.toLowerCase());
                                });//brews foreach
                            }//if temp2  
                    }//if bar beers
                } //beers foreach
            }); // bars foreach
            all_names[i] = { name:bar.name.toLowerCase(), type:"bares", beers: temp.join(" "), brew: temp2.join(" "), style: temp3.join(" ")};
            
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

    if(input === "cheves"){
        all_names = [];
        i = 0;
        beers.forEach(function (beer){
            all_names[i] = beer.name.toLowerCase();
            i++;
        });
        $("#info_cervezas").html(all_names.join(" - ")); 
    }

    if(input === "cervecerias"){
        all_names = [];
        i = 0;
        brews.forEach(function (brew){
            all_names[i] = brew.name.toLowerCase();
            i++;
        });
        $("#info_cervezas").html(all_names.join(" - ")); 
    }

    if(input === "bares"){
        all_names = [];
        i = 0;
        bars.forEach(function (bar){
            all_names[i] = bar.name.toLowerCase();
            i++;
        });
        $("#info_cervezas").html(all_names.join(" - ")); 
    }

     $('#search').keydown(function(e){
        if(e.keyCode == 8) {
            var y = 0;
            var length = all_markers.length;
            for(var i=0; i<length; i++){
                for(var x=0; x<search_results.length; x++){
                    if(all_markers[i].title.toLowerCase() === search_results[x].brew){
                        y++;
                    }  //if all_markers   
                }// for X
            if(y !== 0)
                all_markers[i].setVisible(true);
            y=0;
            //console.log(markers[i].title);   
            }//for I
        }// if e
    });// #search
    
    
}//searchMarker

function clearSearch(all_markers, map, directionsDisplay)
{
   $('#search').val("");
   //directionsDisplay.setMap(null);
   for (var i = 0; i < all_markers.length; i++) {
        all_markers[i].setVisible(true);
    }
    map.setOptions({ zoom: 12});
    $('#search').focus();



} //clearSearch


function keepMarkers(res, markers){
    var y = 0;

    if(typeof res[0] === 'undefined' || $('#search').val() == ""){
        $("#info_cervezas").html("<p> No hay resultados sobre su busqueda. Si cree que es un error o una nueva cerveceria / bar / tienda que se quiere unir a nosotros favor de mandar correo a:<br> <strong> contacto@bcbeermap.com</strong>");
        for (var i = 0; i < all_markers.length; i++) {
            all_markers[i].setVisible(true);
        }//for i
    }// if typeof
    else {
        var length = markers.length;
        for(var i=0; i<length; i++){
            for(var x=0; x<res.length; x++){
                if(markers[i].title.toLowerCase() === res[x].brew || markers[i].title.toLowerCase() === res[x].name ){
                    y++;
                }   //if markers  
            }//for x
            if(y === 0){
                markers[i].setVisible(false);
            }//if y
                
            y=0;
        }//for i
    }//else
} //keep markers  


function infoCervezas(beers, what){
    var i=0;
    $("#info_cervezas").append("<div class='row'>");
    beers.forEach(function (beer){
        if(what === 'bar')
            $("#info_cervezas").append("<div class='col-sm-2 text-center' id="+ beer.id + " onclick='modal(this.id, beers);'>  <a href='#' data-toggle='modal' data-target='#modal' style='text-decoration: none; color:black'><img src='../assets/img/bcbeermap.png' style='height: 100px; width: auto;'><br><h4>"+ beer.brewName + "</h4><h4><strong>"+ beer.name + "</strong></h4></a><div>");
        else
            $("#info_cervezas").append("<div class='col-sm-2 text-center' id="+ beer.id + " onclick='modal(this.id, beers);'> <a href='#' data-toggle='modal' data-target='#modal' style='text-decoration: none; color:black'><img src='../assets/img/bcbeermap.png' style='height: 100px; width: auto;'><br><h4>"+ beer.name + "</h4></a><div>");

        i++;    

        if(i === 6){$("#info_cervezas").append("</div>"); $("#info_cervezas").append("<br><div class='row'>");
           
           i=0;
        }
        $("#info_cervezas").append("</div>");
    }); //foreach
    
} //infoCervezas

function modal(id, beers){

    beers.forEach(function (beer){
        if(beer.id ===  parseInt(id)){
            $("#modal_title").html("<h2>"+ beer.name +"</h2>");
            $("#beer_logo").html("<img src='../assets/img/bcbeermap.png' style='height: 100px; width: auto;'>");

            if(beer.alcohol !== null)
                $("#body_info").html("<h4>Alcohol: "+ beer.alcohol +"%</h4>");
            else
                $("#body_info").html("<h4>Alcohol: 0%</h4>");
            if(typeof beer.type !== 'object')
                $('#body_info').append("<h4>Estilo: "+ beer.type +"</h4>");
            else
                $('#body_info').append("<h4>Estilo:</h4><h6>No hay estilo para esta cerveza. Contactanos <strong> contacto@bcbeermap.com</strong></h6>");
            if(beer.desc !== null)
                $("#body_info").append("<h4>Descripción</h4>" + beer.desc);
            else
               $("#body_info").append("<h4>Descripción</h4>No hay descripción para esta cerveza. Si estan interesados en dar mas información favor de contactarse con nosotros a:<br> <strong> contacto@bcbeermap.com</strong>"); 

        }//if beer.id

    });
}