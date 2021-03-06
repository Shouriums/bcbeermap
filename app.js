var request = require('request');
var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var server = require('http').Server(app);

var urlBrewery = 'http://beermapapi.azurewebsites.net/api/brewery'; //
var urlRendezvous = 'http://beermapapi.azurewebsites.net/api/rendezvous';
var urlBeer = "http://beermapapi.azurewebsites.net/api/beer";
var urlType = "http://beermapapi.azurewebsites.net/api/beer/type";

var bIds =[];
var i=0;
var PORT = process.env.PORT || 3000;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use('/assets', express.static(__dirname + '/assets')); 

app.get('/', function (req,res){

	request(urlBrewery, function (error, response, body){
		if (!error && response.statusCode == 200){
			var brewerys = [];
			data = JSON.parse(body);
			data.Data.forEach(function (brew){
				brewerys[i] = {
					name: brew.Name,
					geo: brew.Geolocation,
					dir: brew.Direction,
					id: brew.BreweryId,
					contacto: brew.Contact,
					logo: brew.Logo
				}
				i++;
			});
		i=0;

		request(urlRendezvous, function (error, response, body){
			if (!error && response.statusCode == 200){
				var rendezvous = [];
				data = JSON.parse(body);
				data.Data.forEach(function (rend){
					rendezvous[i] = {
						name: rend.Name,
						geo: rend.Geolocation,
						geo2: rend.Geolocation2,
						id: rend.RendezvousId,
						contacto: rend.Contact,
						beers: rend.Beers
					}
				i++;
				});
		i=0;
		request(urlBeer, function (error, response, body){
			if (!error && response.statusCode == 200){
				var beers = [];
				data = JSON.parse(body);
				data.Data.forEach(function (beer){
					beers[i] = {
						name: beer.Name,
						alcohol: beer.Alcohol,
						desc: beer.Description,
						IBUs: beer.IBUS,
						type: beer.Types,
						brew: beer.Breweries,
						id: beer.BeerId
					} //beers
				i++;
				}); //foreach data
		i=0;

		request(urlType, function (error, response, body){
			if (!error && response.statusCode == 200){
				var type = [];
				data = JSON.parse(body);
				beers.forEach(function (beer){
					data.Data.forEach(function (type){
					if(parseInt(beer.type) === type.BeerTypeId){
						beer.type = type.Name; 
					} //if parseint
				});//foreach type
				}); //forEach beers
				
				
				
			} //if error type

			beers = JSON.stringify(beers);
			rendezvous = JSON.stringify(rendezvous);
			brewerys = JSON.stringify(brewerys);
			res.render('index', {brewerys: brewerys, rendezvous: rendezvous, beers: beers});

		}); // urlType
					
			
			} // if error beers

			

		}); //request url Beer

				
			} //if error url rendezvous

			
		});

		}
		else
			res.send(error);
	});

	    	
}); // get /

app.get('/cerveceria/:id', function (req,res){
	request(urlBrewery, function (error, response, body){
		if (!error && response.statusCode == 200){
			var req_id = parseInt(req.params.id);
			data = JSON.parse(body);
			data.Data.forEach( function(brew){
				
				if(req_id === brew.BreweryId)
				{
					data = brew;
					console.log(data);
				}//if
			}); //foreach
			data = JSON.stringify(data);
			res.render('cerveceria', {data: data});

		}
	}); //request

}); // get /cerveceria/:id

server.listen(PORT, function(){
	console.log('Server running');
});