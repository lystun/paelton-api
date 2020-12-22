const AWS = require('aws-sdk');

const awsS3 = new AWS.S3({
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_KEY,
    accessKeyId: 'AKIAJL44YEYTPZQEEYNQ',
    secretAccessKey: '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',
})


module.exports = awsS3
