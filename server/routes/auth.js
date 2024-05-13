const router = require("express").Router();
const admin = require("../config/firebase.config");
const user = require("../models/user");

router.get("/login", async (req, res) => {
    if (!req.headers.authorization) {
        console.log("No authorization header found");
        return res.status(500).send({ message: "Invalid Token" });
    }
    const token = req.headers.authorization.split(" ")[1];
    //console.log("Token:", token);
    try {
        const decodeValue = await admin.auth().verifyIdToken(token);
        //console.log("Decoded Value:", decodeValue);
        if (!decodeValue) {
            //console.log("Token verification failed");
            return res.status(505).json({ message: "Un Authorized" });
        } else {
            //checking user exists or not
            const userExists = await user.findOne({ "user_id": decodeValue.user_id });
            //console.log("User Exists:", userExists);
            if (!userExists) {
                newUserData(decodeValue, req, res);
                //console.log("User does not exist");
                return res.send("Need to create");
            } else {
                //console.log("User exists");
                updateNewUserData(decodeValue, req, res); // Call update function if user exists
            }
        }
    } catch (error) {
        //console.error("Error:", error);
        return res.status(505).json({ message: error });
    }
});

const newUserData = async (decodeValue, req, res) => {
    const newUser = new user({
        name: decodeValue.name,
        email: decodeValue.email,
        imageURL: decodeValue.picture,
        user_id: decodeValue.user_id,
        email_verified: decodeValue.email_verified,
        role: "admin",
        auth_time: decodeValue.auth_time
    });
    try {
        const savedUser = await newUser.save();
        res.status(200).send({ user: savedUser });
    } catch (error) {
        updateNewUserData(decodeValue, req, res); // If saving fails, attempt to update instead
    }
};

const updateNewUserData = async (decodeValue, req, res) => {
    const filter = { user_id: decodeValue.user_id };
    const options = {
        upsert: true,
        new: true
    };
    try {
        const result = await user.findOneAndUpdate(
            filter,
            { auth_time: decodeValue.auth_time }, // This will update the auth_time for exisitng user

            options
        );
        res.status(200).send({ user: result });
    } catch (error) {
        res.status(400).send({ success: false, msg: error });
    }
};

router.get("/getUsers", async (req, res) => {
    const options = {
        sort: { createdAt: 1 }
    };
    try {
        const users = await user.find({}, null, options);
        if (users.length === 0) {
            return res.status(404).send({ success: false, message: "No users found" });
        }
        res.status(200).send({ success: true, data: users });
    } catch (error) {
        console.error("Failed to retrieve users:", error);
        res.status(500).send({ success: false, message: "Server error retrieving users" });
    }
});


router.put("/updateRole/:id", async (req, res) => {
    const filter = { _id: req.params.id };
    const role = req.body.data.role;
    const options = {
        upsert: true,
        new: true
    }; try {
        const result = await artist.findOneAndUpdate(filter,
            {
                role: role
            },
            options);

        return res.status(200).send({ user: result });
    }

    catch (error) {
        return res.status(400).send({ success: false, msg: error });


    }
});


module.exports = router;
