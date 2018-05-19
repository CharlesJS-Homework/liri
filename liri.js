/* eslint-env node, es6 */

require('dotenv').config();

const request = require('request');
const fs = require('fs');

const Spotify = require('node-spotify-api');
const Twitter = require('twitter');
const keys = require('./keys.js');

const spotify = new Spotify(keys.spotify);
const client = new Twitter(keys.twitter);

function handleError(error) {
  console.log(`Error: ${error}`);
  process.exit(1);
}

function myTweets() {
  // This will show your last 20 tweets and when they were created at in your terminal/bash window.

  client.get('statuses/user_timeline', (error, tweets) => {
    if (error) {
      handleError(error);
    }

    tweets.slice(0, 20).reverse().forEach((tweet) => {
      const date = tweet.created_at;
      const text = tweet.text;

      console.log(`${date}: ${text}`);
    });
  });
}

function spotifyThisSong(name) {
  spotify.search({ type: 'track', query: name }, (error, data) => {
    if (error) {
      handleError(error);
    }

    if (!data.tracks.items || data.tracks.items.length === 0) {
      console.log('No songs found matching that search');
      process.exit(0);
    }

    const track = data.tracks.items[0];
    const artists = track.artists;

    if (artists) {
      if (artists.length === 1) {
        console.log(`Artist: ${artists[0].name}`);
      } else {
        console.log(`Artists: ${artists.map(artist => artist.name).join(', ')}`);
      }
    }

    console.log(`Name: ${track.name}`);

    if (track.preview_url) {
      console.log(`Preview URL: ${track.preview_url}`);
    } else {
      console.log('No Preview URL');
    }

    console.log(`Album: ${track.album.name}`);
  });
}

function movieThis(name) {
  const url = `http://omdbapi.com/?apikey=trilogy&t=${name.replace(' ', '+')}`;

  request(url, (error, response, data) => {
    if (error) {
      handleError(error);
    }

    if (!data) {
      console.log('No movies found matching that search');
      process.exit(0);
    }

    const movie = JSON.parse(data);

    console.log(`Title: ${movie.Title}`);
    console.log(`Released ${movie.Year}`);

    let imdbRating;
    let rtRating;

    if (movie.Ratings) {
      movie.Ratings.forEach((rating) => {
        switch (rating.Source) {
          case 'Internet Movie Database':
            imdbRating = rating.Value;
            break;
          case 'Rotten Tomatoes':
            rtRating = rating.Value;
            break;
          default:
            break;
        }
      });
    }

    console.log(`IMDB Rating: ${imdbRating || 'Not Rated'}`);
    console.log(`Rotten Tomatoes Rating: ${rtRating || 'Not Rated'}`);

    console.log(`Country: ${movie.Country}`);
    console.log(`Language: ${movie.Language}`);
    console.log(`Plot: ${movie.Plot}`);
    console.log(`Actors: ${movie.Actors}`);
  });
}

function doWhatItSays() {
  fs.readFile('./random.txt', 'utf8', (error, data) => {
    if (error) {
      handleError(error);
    }

    const params = data.split(',');

    if (!params || params.length < 2) {
      handleError('Bad input data');
    }

    function parseString(s) {
      const trimmed = s.trim();

      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, trimmed.length - 1);
      }

      return trimmed;
    }

    parseInput(params.map(parseString));
  });
}

function parseInput(args) {
  switch (args[0]) {
    case 'my-tweets':
      myTweets();
      break;
    case 'spotify-this-song':
      spotifyThisSong(args[1] || 'the sign ace of base');
      break;
    case 'movie-this':
      movieThis(args[1] || 'Mr. Nobody');
      break;
    case 'do-what-it-says':
      doWhatItSays();
      break;
    default:
      console.log('Unknown command! Accepted commands are: my-tweets, spotify-this-song, movie-this, do-what-it-says');
      process.exit(1);
  }
}

if (process.argv.length < 3) {
  console.log('Usage: liri.js cmd_name [args]');
  process.exit(1);
}

parseInput(process.argv.slice(2));
