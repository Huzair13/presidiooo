const moviesRouter = require('./routes/moviesRouter');
const express = require('express');
const cors = require('cors');

require('dotenv').config();


const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

moviesRouter.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
