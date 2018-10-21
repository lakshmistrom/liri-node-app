//loads all api keys
require("dotenv").config();

//access keys from the file
var keys = require("./keys");

// Include the request npm package, node-spotify-api, moment, fs
//(Don't forget to run "npm install request", "npm install node-spotify-api", "npm install moment" in this folder first!)
var request = require("request");
var Spotify = require("node-spotify-api");
var moment = require("moment");
var fs = require("fs");

//creates a new spotify key
var spotify = new Spotify(keys.spotify);

//creates a new omdbapi key
var omdbapi = keys.omdb;

//creates a new bands in town api key
var bandsInTown = keys.bandsInTown;

//input from the user
var command = process.argv[2];

// Grab the movieName, concert, song, do-what-it-says command which will always be the third node argument and assign it to an array.
var nameArr = process.argv.slice(3);

//join the elements of the array to a string
var commandCall = (nameArr).join(" ");


//will be able to hold the following commands
//concert-this, spotify-this-song, movie-this, do-what-it-says
function choose(inputCommand) {
    //choose what command to run
    switch (inputCommand) {
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
            doWhatItSays();
            break;
    }
}

//runs the commands themselves
choose(command);

//calls and returns omdbapi data
function omdbCall() {
    //handles the case where the user doensn't provide a movie
    if (commandCall === "") {
        //default movie
        commandCall = "Mr. Nobody";
    }

    // Then run a request to the OMDB API with the movie specified
    var ombdUrl = "http://www.omdbapi.com/?t=" + commandCall + "&y=&plot=short&apikey=" + omdbapi.apikey;

    //request movie to the api
    request(ombdUrl, function (error, response, body) {
        // initialize the data to be accessed
        let movieApiData = JSON.parse(body);

        // If the request is successful
        if (!error && response.statusCode === 200 && movieApiData.Error === undefined) {
            //* Title of the movie.
            console.log("Title: " + movieApiData.Title);
            //* Year the movie came out.
            console.log("Release Year: " + movieApiData.Year);
            //* IMDB Rating of the movie.
            console.log("IMDB Rating: " + movieApiData.imdbRating);
            //* Rotten Tomatoes Rating of the movie.
            console.log(movieApiData.Ratings[1].Source + ": " + movieApiData.Ratings[1].Value);
            //* Country where the movie was produced.
            console.log("Country: " + movieApiData.Country);
            //* Language of the movie.
            console.log("Language: " + movieApiData.Language);
            //* Plot of the movie.
            console.log("Plot: " + movieApiData.Plot);
            //* Actors in the movie.
            console.log("Actors: " + movieApiData.Actors);
        } else {
            //handles wrong movie input
            console.log(movieApiData.Error);
        }
    });
}

//calls and returns bandsInTown data
function bandsInTownCall() {
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
    //handles no song input
    if (nameArr.length !== 0) {
        //converts the array that holds the data input from the user to as string becoming the song name
        nameArr = nameArr.join(" ");
    } else {
        //pass in the following song in case no song was passed in
        nameArr = "The Sign";
    }

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
            //initializes artist
            var artist = spotifyData[key].album.artists;
            //initializes name of the song
            var songName = spotifyData[key].name;

            //make sure the name of the songs matches to the results from the api exactly
            if (songName.toLowerCase().search(nameArr.toLowerCase()) === -1) {
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
            for (let innerKey in artist) {
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
        for (let keyName in nameSet) {
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

//runs the data file random.txt
function doWhatItSays() {
    // This block of code will read from the "random.txt" file.
    // It's important to include the "utf8" parameter or the code will provide stream data (garbage)
    // The code will store the contents of the reading inside the variable "data"
    fs.readFile("random.txt", "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }

        // We will then print the contents of data
        console.log(data);

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        //remove quotation marks from the data comming from the file and initialize the nameArr array from the elements that contain spaces in between
        nameArr = dataArr[1].replace("\"", "").split(" ");

        //initialize
        commandCall = nameArr.join(" ");
        //send commands to choose from
        choose(dataArr[0]);
    });
}