const express = require("express");
const { route } = require("./ticket.router");
const router = express.Router();

const {
	insertUser,
	getUserByEmail,
	getUserById,
	updatePassword,
	storeUserRefreshJWT,
	verifyUser,
} = require("../model/user/User.model");
const {
	hashPassword,
	comparePassword,
} = require("../../src/helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middleware/Authorization.middleware");
const {
	setPasswordResetPin,
	getPinByEmailPin,
	deletePin,
} = require("../model/resetPin/ResetPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const {
	emailValidation,
	updatePassReqValidation,
	signUpDataValidation,
} = require("../middleware/formValidation.middleware");
const { deleteJWT } = require("../helpers/redis.helper");

const frontEndURL = "http://localhost:3000/";
const verifyURL = frontEndURL + "verification/";

router.all("/", (req, res, next) => {
	//below line if uncommented creates ERR_HTTP_HEADERS sent- multiple headers due to res.json
	//res.json({ message: "return from user router, let's go" });

	next();
});

//GET user profile router
router.get("/", userAuthorization, async (req, res) => {
	//3. extract user id- 1. & 2. done inside auth middleware

	const _id = req.userId;
	const userProfile = await getUserById(_id);
	//4. get user profile based on the user id
	const { name, email } = userProfile;
	res.json({
		user: {
			_id,
			name,
			email,
		},
	});
});

//verify user after user has signedup
router.patch("/verify", async (req, res) => {
	try {
		const { _id, email } = req.body;
		//update our users collection in db
		const result = await verifyUser(_id, email);
		console.log(result);
		if (result && result._id) {
			return res.json({
				status: "success",
				message: "Your account has been verified please sign in to continue",
			});
		}
		return res.json({ status: "error", message: "invalid request" });
	} catch (error) {
		console.log(error.message);
		res.json({ status: "error", message: "invalid request" });
	}
});

//Create-- new user --router
router.post("/", signUpDataValidation, async (req, res) => {
	const { name, company, address, phone, email, password } = req.body;

	try {
		//hash password
		const hashedPass = await hashPassword(password);
		const newUserObj = {
			name,
			company,
			address,
			phone,
			email,
			password: hashedPass,
		};
		const result = await insertUser(newUserObj);
		console.log(result);

		//send verification email
		await emailProcessor({
			email,
			type: "new-user-confirmation-required",
			verificationLink: verifyURL + result._id + "/" + email,
		});

		res.json({ status: "success", message: "New user created", result });
	} catch (error) {
		console.log(error);
		let message = "Unable to create new user at the moment Please try later";
		res.json({ status: "error", /* message: error.*/ message });
	}
});

//user LOGIN sign in router
router.post("/login", async (req, res) => {
	console.log(req.body);
	//USER email AUTHentication via bcrypt
	const { email, password } = req.body;
	// console.log({ email, password });
	//server side check for null values
	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submission" });
	}

	//get user's _id with email from db
	const user = await getUserByEmail(email);

	//check if acc is verified
	if (!user.isVerified) {
		return res.json({ status: "error", message: "pls verify acc first" });
	}

	//console.log(user._id.toString());
	//get encrypted password using _id from db for comparison
	const passFromDb = user && user._id ? user.password : null;
	if (!passFromDb) {
		return res.json({ status: "error", message: "invalid email or password" });
	}
	//compare with db- comparePassword func from bcrypt
	const result = await comparePassword(password, passFromDb);

	if (!result) {
		//returns false
		return res.json({ status: "error", message: "invalid email or password" });
	}

	//else create AUTH TOKENS
	const accessJWT = await createAccessJWT(user.email, `${user._id}`);
	const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);
	//send tokens to user
	res.json({
		status: "success",
		message: "Login successful",
		accessJWT,
		refreshJWT,
	});
});

//reset password
// A. Create and send password reset pin number
router.post("/reset-password", emailValidation, async (req, res) => {
	// 1.Receive email
	const { email } = req.body;
	// 2. check if user exists in db using email
	const user = await getUserByEmail(email);

	if (user && user.id) {
		// 3. create unique 6 digit pin AND 4. save pin and email in new collections
		const setPin = await setPasswordResetPin(email);
		// 5. email the pin
		await emailProcessor({
			email,
			pin: setPin.pin,
			type: "request-new-password",
		});
		return res.json({
			status: "success",
			message:
				"The password reset pin will be sent shortly to the email address provided",
		});
	}

	res.json({
		status: "error",
		message:
			"The password reset pin will be sent shortly to the email address provided",
	});
});

// B. update password in db
router.patch("/reset-password", updatePassReqValidation, async (req, res) => {
	// 1.receive email pin and new password
	const { email, pin, newPassword } = req.body;

	const getPin = await getPinByEmailPin(email, pin);
	// 2. validate pin
	if (getPin && getPin._id) {
		const dbDate = getPin.addedAt;
		const expiresIn = process.env.EXPIRY_DATE_PIN;

		let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);
		const today = new Date();
		error.message;

		if (today > expDate) {
			return res.json({ status: "error", message: "Invalid or expired pin" });
		}
		// 3. encrypt new password
		const hashPass = await hashPassword(newPassword);
		// 4. update password in db
		const result = await updatePassword(email, hashPass);

		if (result._id) {
			// 5. send email Notification
			await emailProcessor({ email, type: "password-update-success" });
			//delete pin from db
			deletePin(email, pin);

			return res.json({
				status: "success",
				message: "Your password has been updated",
			});
		}
	}

	res.json({
		status: "error",
		message: "Unable to update your password, please try again later",
	});
});

//logout client user
router.delete("/logout", userAuthorization, async (req, res) => {
	const { authorization } = req.headers;
	//this data coming from database
	const _id = req.userId;
	console.log(_id);

	//2.delete accessJWT from redis database
	deleteJWT(authorization);

	//3.delete refreshJWT from mongoDB
	const result = await storeUserRefreshJWT(_id, "");

	if (result._id) {
		return res.json({ status: "success", message: "Logged out successfully" });
	}
});

module.exports = router;
