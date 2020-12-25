const express = require('express');
const app = express()

const morgan = require('morgan'); 
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(compression())

//Serving static files
// app.use(express.static(`${__dirname}/public`));

if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

const bookRouter = require('./routes/bookRoutes')
const userRouter = require('./routes/userRoutes')
const audioRouter = require('./routes/audioRoutes')
const articleRouter = require('./routes/articleRoutes')
const testimonialRouter = require('./routes/testimonialRoutes')

//application routes
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/audios', audioRouter);
app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/testimonials', testimonialRouter);


app.all('*', (req, res, next) => {
    return next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler)

module.exports = app