const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');

const app = express()
const helmet = require('helmet');

app.use(cors())
app.use(helmet())

if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

const audioRouter = require('./routes/audioRoutes')
const articleRouter = require('./routes/articleRoutes')

//application routes
app.use('/api/v1/audios', audioRouter);
app.use('/api/v1/articles', articleRouter);


module.exports = app