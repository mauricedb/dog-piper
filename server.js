// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var Rx = require('rx');
var fetch = require('isomorphic-fetch');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});


app.get("/movies", function (request, response) {
  var movies = []
  Rx.Observable
    .range(0, 25)
    // .filter(page => !(page % 7))
    .flatMap(page => 
      fetch('http://rawstack.azurewebsites.net/api/movies?page=' + page)
        .then(resp => resp.json())
    )
    .flatMap(movie => movie)
    .map(movie => ({
      id: movie.id,
      title: movie.title,
      directors: movie.abridgedDirectors,
      description: movie.criticsConsensus,
      posters: movie.posters
    }))
    .subscribe(e => {

      movies.push(e)
    }, 
    err => console.error(err),
    () => {
      movies.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      })
      response.send(movies);
      
    });
    
  // response.send([{a:2}]);
});

app.get("/mm", function (request, response) {
  response.write("[\n");

  Rx.Observable
    .range(0, 25)
    // .filter(page => !(page % 7))
    .flatMap(page => 
      fetch('http://rawstack.azurewebsites.net/api/movies?page=' + page)
        .then(resp => resp.json())
    )
    .flatMap(movie => movie)
    .map(movie => ({
      id: movie.id,
      title: movie.title,
      directors: movie.abridgedDirectors,
      description: movie.criticsConsensus,
      posters: movie.posters
    }))
    .subscribe(e => {
      response.write(JSON.stringify(e))
      response.write(",\n");
    }, 
    err => console.error(err),
    () => {
      response.write("]");
      response.end();
    });
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes",
  "John Skeet can devide by zero.",
  "And Chuck Norris as well"
  ];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
