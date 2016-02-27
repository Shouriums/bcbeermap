var request = require('request');
var express = require('express');
var exphbs  = require('express-handlebars');
var app = express();
var server = require('http').Server(app);

var urlBrewery = 'http://beermapapi.azurewebsites.net/api/brewery'; //
var urlRendezvous = 'http://beermapapi.azurewebsites.net/api/rendezvous';

var bIds =[];
var i=0;
var PORT = process.env.PORT || 3000;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

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
					id: brew.BreweryId
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
						id: rend.RendezvousId
					}
				i++;
				});
		i=0;	

				rendezvous = JSON.stringify(rendezvous);
				brewerys = JSON.stringify(brewerys);
				res.render('index', {brewerys: brewerys, rendezvous: rendezvous});
			}

			
		});

		}
		else
			res.send(error);
	});

	    	
});

server.listen(3000, function(){
	console.log('Server running');
});