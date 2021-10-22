const express = require("express");
const { route } = require("./ticket.router");
const router = express.Router();

const { insertUser, getUserByEmail } = require("../model/user/User.model");
const {
	hashPassword,
	comparePassword,
} = require("../../src/helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");

router.all("/", (req, res, next) => {
	//res.json({ message: "return from user router" });

	next();
});

//Create new user route
router.post("/", async (req, res) => {
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

		res.json({ message: "New user created", result });
	} catch (error) {
		console.log(error);
		res.json({ status: "error", message: error.message });
	}
});

//user sign in router
router.post("/login", async (req, res) => {
	console.log(req.body);
	//USER AUTH via bcrypt
	const { email, password } = req.body;
	// console.log({ email, password });
	//server side check for null values
	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submission" });
	}

	//get user with email from db
	const user = await getUserByEmail(email);
	//console.log(user);
	//get password from db
	const passFromDb = user && user._id ? user.password : null;
	if (!passFromDb) {
		return res.json({ status: "error", message: "invalid email or password" });
	}
	//compare with db- comparePassword func from bcrypt
	const result = await comparePassword(password, passFromDb);
	if (!result) {
		return res.json({ status: "error", message: "invalid email or password" });
	}
	//create AUTH TOKENS
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

module.exports = router;
