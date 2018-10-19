//checks to make sure the file is being loaded
console.log("this is loaded.");

//loads spotify api key
exports.spotify = {
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
};

//loads omdb api key
exports.omdb = {
    apikey: process.env.apikey,
}

//loads bandsInTown api key
exports.bandsInTown = {
    app_id: process.env.app_id
}

//module.exports = keys;