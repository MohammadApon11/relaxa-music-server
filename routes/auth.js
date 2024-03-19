const router = require("express").Router();
const admin = require("../config/firebase.config");
const user = require("../models/user");

router.get("/login", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(500).send({ message: "Invalid authorization" });
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodeValue = await admin.auth().verifyIdToken(token);

    if (!decodeValue) {
      return res.status(500).json({ message: "Unauthorized" });
    } else {
      // checking user exist or not
      const userExist = await user.findOne({ user_id: decodeValue.user_id });
      console.log("userExist", userExist);
      if (!userExist) {
        newUserData(decodeValue, req, res);
      } else {
        updateNewUserData(decodeValue, req, res);
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

const newUserData = async (decodeValue, req, res) => {
  const newUser = new user({
    name: decodeValue?.name,
    email: decodeValue?.email,
    imageURL: decodeValue?.picture,
    user_id: decodeValue?.user_id,
    email_varified: decodeValue?.email_verified,
    role: "memeber",
    auth_time: decodeValue?.auth_time,
  });
  try {
    const savedUser = await newUser.save();
    console.log("savedUser", savedUser);
    res.status(200).send({ user: savedUser });
  } catch (error) {
    res.status(400).send({ success: false, message: error });
  }
};

const updateNewUserData = async (decodeValue, req, res) => {
  const filter = { user_id: decodeValue.user_id };
  const options = {
    upsert: true,
    new: true,
  };
  try {
    const result = await user.findOneAndUpdate(
      filter,
      { auth_time: decodeValue.auth_time },
      options
    );
    res.status(200).send({ user: result });
  } catch (error) {
    res.status(400).send({ success: false, message: error });
  }
};

router.get("/getUsers", async (req, res) => {
  const options = {
    // sort returned documents in ascending order
    sort: { createdAt: 1 },
    // Include only the following
    // projection : {}
  };

  const cursor = await user.find();
  if (cursor) {
    res.status(200).send({ success: true, data: cursor });
  } else {
    res.status(200).send({ success: true, msg: "No Data Found" });
  }
});

router.put("/updateRole/:userId", async (req, res) => {
  console.log(req.body.data.role, req.params.userId);
  const filter = { _id: req.params.userId };
  const role = req.body.data.role;

  const options = {
    upsert: true,
    new: true,
  };

  try {
    const result = await user.findOneAndUpdate(filter, { role: role }, options);
    res.status(200).send({ user: result });
  } catch (err) {
    res.status(400).send({ success: false, msg: err });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  const filter = { _id: req.params.userId };

  const result = await user.deleteOne(filter);
  if (result.deletedCount === 1) {
    res.status(200).send({ success: true, msg: "Data Deleted" });
  } else {
    res.status(200).send({ success: false, msg: "Data Not Found" });
  }
});

module.exports = router;
