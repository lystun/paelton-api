const AWS = require('aws-sdk');

let awsS3;


const formatCredentials = (value) => {
    return value.replace(/[",]+/g,'')
}

if (process.env.NODE_ENV === 'development'){
    awsS3 = new AWS.S3({
        accessKeyId: formatCredentials(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: formatCredentials(process.env.AWS_SECRET_KEY),
    })
}

if (process.env.NODE_ENV === 'production'){
    awsS3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    })
}


module.exports = awsS3
