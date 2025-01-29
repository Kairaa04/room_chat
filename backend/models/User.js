const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: {
      unique: true,
      partialFilterExpression: { email: { $exists: true } },
    }, // Partial index for email
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    index: {
      unique: true,
      partialFilterExpression: { mobile: { $exists: true } },
    }, // Partial index for mobile
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
