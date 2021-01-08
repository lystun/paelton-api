const AWS = require('aws-sdk');

const formatCredentials = (value) => {
    return value.replace(/[",]+/g,'')
}

const awsS3 = new AWS.S3({
    accessKeyId: formatCredentials(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: formatCredentials(process.env.AWS_SECRET_KEY),
})


module.exports = awsS3
