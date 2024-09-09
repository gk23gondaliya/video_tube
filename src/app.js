const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

/* ---------------------- Middlewares ---------------------- */
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

const userRoutes = require('./routes/user.routes');
const videoRoutes = require("./routes/video.routes");

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/video', videoRoutes);


module.exports  = { app };