const PORT = process.env.EXPRESS_PORT || 3000;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// middleware
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

// router import
const personRouter = require('./routes/personRouter.js');

// router use
app.use('/api/person', personRouter);


// server start
app.listen(PORT, () => {
        console.log("Server is listening on port " + PORT);
    }
);