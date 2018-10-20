//loads all api keys
require("dotenv").config();

//access keys from the file
var keys = require("./keys");
//var keys = require("./keys.js")

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

var command = process.argv[2];
//console.log(command);
// Grab the movieName, concert, song, do what it says command which will always be the third node argument.
var nameArr = process.argv.slice(3);
//console.log("nameARR join"+nameArr.join(" "));
var commandCall = (nameArr).join("");
//console.log(commandCall);
//for example the commands will be read as such
//will be able to hold the following commands
//concert-this, spotify-this-song, movie-this, do-what-it-says
switch (command) {
    case "concert-this":
        bandsInTownCall();
        break;
    case "spotify-this-song":
        spotifyApi();
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
            console.log("Title: " + JSON.parse(body).Title);
            //* Year the movie came out.
            console.log("Release Year: " + JSON.parse(body).Year);
            //* IMDB Rating of the movie.
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
            //* Rotten Tomatoes Rating of the movie.
            console.log(JSON.parse(body).Ratings[1].Source + ": " + JSON.parse(body).Ratings[1].Value);
            //* Country where the movie was produced.
            console.log("Country: " + JSON.parse(body).Country);
            //* Language of the movie.
            console.log("Language: " + JSON.parse(body).Language);
            //* Plot of the movie.
            console.log("Plot: " + JSON.parse(body).Plot);
            //* Actors in the movie.
            console.log("Actors: " + JSON.parse(body).Actors);
        }
    });
}

//calls and returns bandsInTown data
function bandsInTownCall() {
    //handle space conversion to + for commandCall
    // Then run a request to the bandsintown API with the artist specified
    var bandsInTownUrl = "https://rest.bandsintown.com/artists/" + commandCall + "/events?app_id=" + bandsInTown.app_id + "&date=upcoming";

    request(bandsInTownUrl, function (error, response, body) {
        //concert-this <artist/band name here>
        console.log(bandsInTownUrl);
        // If the request is successful
        if (!error && response.statusCode === 200) {
            //console.log(error);
            //console.log(response);
            //console.log(body);
            // Parse the body of the site 
            // (Note: The syntax below for parsing isn't obvious.
            let responseBody = JSON.parse(body);

            //console.log(responseBody);
            for (let key in responseBody) {
                //output the name of the venue
                console.log("Name of the Venue: " + responseBody[key].venue.name);

                //output the name of the venue location
                console.log("Venue Location: " + responseBody[key].venue.city + ", " + responseBody[key].venue.country);

                //output the date of the event per venue
                console.log("Date of Event: " + moment(responseBody[key].datetime).format("MM-DD-YYYY"));

                //to help visualize the separation between venues
                console.log("-------------------------------------------------------");
            }
        }
    });
}

//calls and returns spotify data
function spotifyApi() {
    //converts the array that holds the data input from the user to as string
    nameArr = nameArr.join(" ");

    //will hold the names of the artists
    var spotifyNames = [];

    //will hold the data of the song based on the artist
    var nameSet = {};

    //request spotify to run the search based on the name of the song
    spotify.search({ type: 'track', query: nameArr }, function (err, data) {
        //handles errors in case the data does not return something
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // holds the data returned from spotify
        let spotifyData = data.tracks.items;

        //loops through data set of 20 call backs
         for (let key in spotifyData) {
            var artist = spotifyData[key].album.artists;
            //output name of the song
            var songName = spotifyData[key].name;

            //make sure the name of the songs matches to the results from the api exactly
            if(songName.toLowerCase().search(nameArr.toLowerCase()) === -1){
                //keeps the loop going
                continue;
            }

            //output preview link to song from spotify
            var previewLinkSong = spotifyData[key].external_urls.spotify;

            //output the album the song is from
            var albumName = spotifyData[key].album.name;

            //initialize list of artists
            let artistList = [];
            
            //loop through array of artist
            for(let innerKey in artist){
                //initialize artist name
                var artistName = artist[innerKey].name;

                //add artist name to the array that holds the list of artists
                artistList.push(artistName);
            }
            //create a set that holds the information about the song query based on the name of the artist
            nameSet[artistList.join(", ")] = {
                //assigns the name of the song
                songName: songName,
                //assigns the link to the song in spotify
                previewLinkSong: previewLinkSong,
                //assigns the name of the album
                albumName: albumName
            };
        }
        //loops through the data set of artists
        for(let keyName in nameSet){
            //adds the data 
            spotifyNames.push(
                //add the name of the artist
                "Artist: " + keyName + 

                //add the name of the song
                "\nSong's Name: " + nameSet[keyName].songName +

                //add the url to the spotify song
                "\nPreview Song in Spotify: " + nameSet[keyName].previewLinkSong +
                
                //add the name of the album
                "\nAlbum's Name: " + nameSet[keyName].albumName +

                //add a separator for easier output
                "\n-------------------------------------------------------------------------------");
        }
        //output the data
        console.log(spotifyNames.join("\n"));
    });
}
