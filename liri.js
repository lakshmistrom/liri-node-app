require("dotenv").config();
var spotify = new spotify(keys.spotify);
//will be able to hold the following commands
//concert-this, spotify-this-song, movie-this, do-what-it-says
var nodeArgs = process.argv;
//for example the commands will be read as such
//concert-this <artist/band name here>