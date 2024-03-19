const mongoose = require("mongoose");

const userScheme = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: false,
    },
    user_id: {
      type: String,
      required: true,
    },
    email_verified: {
      type: Boolean,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    auth_time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userScheme);
