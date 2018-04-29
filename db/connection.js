const mongoose = require('mongoose')
const URL = 'mongodb://mongodb:27017/hermyz'

if (process.env.NODE_ENV == 'production') {
  // mongoose.connect(process.env.MLAB_URL)
} else {
  mongoose.connect(URL)
}

mongoose.Promise = Promise

module.exports = mongoose
