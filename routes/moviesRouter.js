const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, getDatabaseInstance } = require('../database/database');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

connectToDatabase();

// Show all movies
app.get('/', async (req, res) => {
    try {
        const dbo = getDatabaseInstance();
        const movies = await dbo.collection('MoviesData').find().toArray();
        const movieNames = movies.map(movie => movie.movieName);
        res.json(movieNames);
    } catch (error) {
        console.error("Error fetching movie names:", error);
        res.status(500).json({ error: 'Error' });
    }

});

// Add new movie
app.post('/addMovies', async (req, res) => {

    const dbo = getDatabaseInstance();

    let movieName=req.body.movieName;
    let director=req.body.director;
    let relaseYear= req.body.relaseYear;
    let language=req.body.language;
    let rating =req.body.rating;

    const existingMovie = await dbo.collection("MoviesData").findOne({ movieName: movieName });

    if (existingMovie) {
        console.log("Movie with the same name already exists.");
        res.status(409).send("Movie with the same name already exists.");
        return; 
    }

    const newMovie={
        movieName : movieName,
        director : director,
        releaseYear :parseInt(relaseYear),
        language :language,
        rating : parseFloat(rating)
    };


    dbo.collection("MoviesData").insertOne(newMovie)
    .then(()=>{
        console.log("One Movie Inserted Successfully !!!!");
        res.send("Insert Successfull ")
    })
    .catch(()=>{
        console.log("Error at Insert !!!");
    });

});

// Update movies
app.put('/movies/:movieName', async (req, res) => {

    const dbo = getDatabaseInstance();

    const { movieName } = req.params;
    const update = req.body;

    console.log(movieName);

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: 'No update fields provided' });
    }
    // Convert releaseYear and rating to integers if they exist in the update
    if (update.releaseYear) {
        update.releaseYear = parseInt(update.releaseYear, 10);
    }

    if (update.rating !== undefined && update.rating !== null) {
        update.rating = parseFloat(update.rating);
    }

    try {
        const result = await dbo.collection('MoviesData').updateOne({ movieName : movieName }, { $set: update });
        if (result.modifiedCount > 0) {
            console.log("Update Sucessfull :)")
            res.send("Update Successfull :)")
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error("Error updating movie details:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Filter movies
app.get('/filter', async (req, res) => {

    const dbo = getDatabaseInstance();

    const { movieName, director, releaseYear, language, rating } = req.query;
    const filter = {};

    if (movieName) filter.movieName = new RegExp(movieName, 'i');
    if (director) filter.director = new RegExp(director, 'i');
    if (!isNaN(releaseYear)) filter.releaseYear = parseInt(releaseYear);
    if (language) filter.language = new RegExp(language, 'i');
    if (!isNaN(rating)) filter.rating = parseFloat(rating);

    try {
        const filteredMovies = await dbo.collection('MoviesData').find(filter).toArray();
        res.json(filteredMovies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// FilterName movies
app.get('/filterName', async (req, res) => {
    const dbo = getDatabaseInstance();
    const { movieName, director, releaseYear, language, rating } = req.query;
    const filter = {};

    if (movieName) filter.movieName = new RegExp(movieName, 'i');
    if (director) filter.director = new RegExp(director, 'i');
    if (!isNaN(releaseYear)) filter.releaseYear = parseInt(releaseYear);
    if (language) filter.language = new RegExp(language, 'i');
    if (!isNaN(rating)) filter.rating = parseFloat(rating);

    try {
        console.log('Filter:', filter); // Log the filter object
        const filteredMovies = await dbo.collection('MoviesData').find(filter).toArray();
        console.log('Filtered Movies:', filteredMovies);

        const movieNames = filteredMovies.map(movie => movie.movieName);
        console.log('Movie Names:', movieNames);

        res.json(movieNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete movie
app.delete('/delete', (req, res) => {

    const dbo = getDatabaseInstance();

    const movieName=req.query.movieName;
    console.log(movieName);
    dbo.collection('MoviesData').deleteOne({movieName : movieName})
    .then(function(result){
        if(result.deletedCount ==1){
            console.log("Movie Deleted Successfully");
            res.send("Movie Deleted Successfully")
        }
        else{
            console.log("Movie Data Not Found");
            res.send("Movie Data Not Found");
        }
    })
    .catch(function(err){
        console.log(err);
    })
});

// Search for a movie
app.post('/search', (req, res) => {

    const dbo = getDatabaseInstance();

    const movieName=req.body.movieName;
    console.log(movieName);
    dbo.collection('MoviesData').find({movieName : movieName}).toArray()
    .then(function(result){
        if(result.length !=0){
            res.send(result);
        }
        else{
            res.send("Movie Not Found")
        }
    })
    .catch(function(err){
        res.send(err);
    });
});

// Number of movies based on certain languages
app.get('/number', (req, res) => {

    const dbo = getDatabaseInstance();

    const {language}= req.query;
    dbo.collection("MoviesData").find({language : language}).toArray()
    .then(function(result){
        const count=result.length;
        res.send({[`Number of ${language} movies`] : count});
    })
    .catch(function(err){
        res.send(err);
    });
});

module.exports = app;
