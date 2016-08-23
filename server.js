// server.js
// where your node app starts



var movies = [];

// init project
var express = require('express');
var app = express();
var Rx = require('rx');
var fetch = require('isomorphic-fetch');

var apiKey='22be462e6d3de1dbab03d1ca50847b5a';

var movies$ = Rx.Observable
  .range(1, 20)
  .flatMap(page => 
    fetch(`http://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}`)
    .then(rsp => rsp.json())
  )
  .map(json => json.results)
  .flatMap(e => e)
  .filter(m => !m.adult)
  .filter(m => m.original_language === 'en');

var genres$ = Rx.Observable
  .just()
  .flatMap(() => 
    fetch(`http://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
    .then(rsp => rsp.json())
  )
  .map(json => json.genres);


movies$  
  .combineLatest(
    genres$,
    (movie, genres) => {
      
      movie.genre = movie.genre_ids.map(id => genres.filter(g => g.id === id).pop().name)
      delete movie.genre_ids;

      return movie;
    })
  .subscribe(m => movies.push(m));
  
// Rx.Observable
//   .fromArray([
//     'tt0093058',
//     'tt0076759',
//     'tt2488496',
//     'tt0266697',
//     'tt0378194',
//     '',
//     '',
//     '',
//     '',
//   ])
//   .filter(id => !!id)
//   .flatMap(id => 
//     fetch(`http://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
//     // fetch(`http://www.omdbapi.com/?i=${id}&plot=full&r=json`)
//       .then(rsp => rsp.json())
//   )
//   .map(m => {
    
//     // m.Actors = m.Actors.split(', ')
//     // m.Genre = m.Genre.split(', ')

//     m.genres = m.genres.map(g => g.name)
//     delete m.spoken_languages
//     delete m.production_countries
//     delete m.production_companies
    
//     return m
//   })
//   .subscribe(m => movies.push(m))

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
   response.json(movies);
  // var movies = []
  // Rx.Observable
  //   .range(0, 25)
  //   // .filter(page => !(page % 7))
  //   .flatMap(page => 
  //     fetch('http://rawstack.azurewebsites.net/api/movies?page=' + page)
  //       .then(resp => resp.json())
  //   )
  //   .flatMap(movie => movie)
  //   .map(movie => ({
  //     id: movie.id,
  //     title: movie.title,
  //     directors: movie.abridgedDirectors,
  //     description: movie.criticsConsensus,
  //     posters: movie.posters
  //   }))
  //   .subscribe(e => {

  //     movies.push(e)
  //   }, 
  //   err => console.error(err),
  //   () => {
  //     movies.sort((a, b) => {
  //       if (a.title < b.title) {
  //         return -1;
  //       } else if (a.title > b.title) {
  //         return 1;
  //       } else {
  //         return 0;
  //       }
  //     })
  //     response.send(movies);
      
  //   });
    
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
