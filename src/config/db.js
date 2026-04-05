const mongoose = require("mongoose");

/**
 * Connect to MongoDB using Mongoose.
 * @param {string} mongoUri
 * @returns {Promise<void>}
 */
async function connectToDatabase(mongoUri) {
  await mongoose.connect(mongoUri);
}

module.exports = {
  connectToDatabase,
};
