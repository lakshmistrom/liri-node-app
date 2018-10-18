//loads all api keys
require("dotenv").config();

//access keys from the file
var keys = require("./keys");

// Include the request npm package, node-spotify-api, moment
//(Don't forget to run "npm install request", "npm install node-spotify-api", "npm install moment" in this folder first!)
var request = require("request");
var Spotify = require("node-spotify-api");
var moment = require("moment");

//tests current date
//console.log (currMoment);

//creates a new spotify key
var spotify = new Spotify(keys.spotify);

//creates a new omdbapi key
var omdbapi = keys.omdb;

//creates a new bands in town api key
var bandsInTown = keys.bandsInTown;

// Grab the movieName, concert, song, do what it says command which will always be the third node argument.
var command = process.argv[2];
var commandCall = process.argv.slice(3).join(" ");

//for example the commands will be read as such
//will be able to hold the following commands
//concert-this, spotify-this-song, movie-this, do-what-it-says
switch (command) {
    case "concert-this":
        bandsInTownCall();
        break;
    case "spotify-this-song":
        break;
    case "movie-this":
        omdbCall();
        break;
    case "do-what-it-says":
        break;
}
//calls and returns omdbapi data
function omdbCall() {
    //handle space conversion to + for commandCall
    // Then run a request to the OMDB API with the movie specified
    var ombdUrl = "http://www.omdbapi.com/?t=" + commandCall + "&y=&plot=short&apikey=" + omdbapi.apikey;

    //concert-this <artist/band name here>
    console.log(ombdUrl);

    request(ombdUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {

            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            //* Title of the movie.
            //* Year the movie came out.
            //* IMDB Rating of the movie.
            //* Rotten Tomatoes Rating of the movie.
            //* Country where the movie was produced.
            //* Language of the movie.
            //* Plot of the movie.
            //* Actors in the movie.

            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            console.log(JSON.parse(body).Ratings[1].Source + ": " + JSON.parse(body).Ratings[1].Value);
            console.log("Country: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
        }
    });
}
function bandsInTownCall() {
    //handle space conversion to + for commandCall
    // Then run a request to the OMDB API with the movie specified
    //https://rest.bandsintown.com/artists/beyonce/events?app_id=codingbootcamp&date=all
    var bandsInTownUrl = "https://rest.bandsintown.com/artists/" + commandCall + "/events?app_id=" + bandsInTown.app_id + "&date=upcoming";

    request(bandsInTownUrl, function (error, response, body) {
        //concert-this <artist/band name here>
        console.log(bandsInTownUrl);
        // If the request is successful
        if (!error && response.statusCode === 200) {
            //console.log(error);
            //console.log(response);
            //console.log(body);
            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            let responseBody = JSON.parse(body);
            //console.log(responseBody);
            for(let key in responseBody){
                console.log("Name of the Venue: " + responseBody[key].venue.name);
                console.log("Venue Location: " +responseBody[key].venue.city + ", " + responseBody[key].venue.country);
                console.log("Date of Event: " + moment(responseBody[key].datetime).format("MM-DD-YYYY"));
               console.log("-------------------------------------------------------");
            }
        }
    });
}