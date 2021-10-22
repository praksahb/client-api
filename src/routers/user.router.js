const express = require("express");
const { route } = require("./ticket.router");
const router = express.Router();

const { insertUser, getUserByEmail } = require("../model/user/User.model");
const {
	hashPassword,
	comparePassword,
} = require("../../src/helpers/bcrypt.helper");

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
	const { email, password } = req.body;

	//get user with email from db
	const user = await getUserByEmail(email);
	console.log(user);

	//hash our password and compare with db- comparePassword func from bcrypt
	const passFromDb = user && user._id ? user.password : null;

	if (!passFromDb) {
		return res.json({
			status: "error",
			message: "invalid email or password",
		});
	}
	const result = await comparePassword(password, passFromDb);
	console.log(result);

	if (!email || !password) {
		return res.json({ status: "error", message: "Invalid form submission" });
	}

	res.json({ status: "success", message: "Login successful" });
});

module.exports = router;
