const express = require("express");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const router = express.Router();

const {
	insertAdmin,
	getAdminIdByEmail,
} = require("../model/admin/Admin.model");

//create one admin atleast --- POST route
router.post("/signup", async (req, res) => {
	const { name, email, password, phone, dob, address } = req.body;

	try {
		//hash pass
		const hashedPass = await hashPassword(password);
		const dAdminObj = {
			name,
			email,
			password: hashedPass,
			phone,
			dob,
			address,
		};
		const result = await insertAdmin(dAdminObj);
		console.log(result);
		res.json({ status: "success", message: "Admin has been created", result });
	} catch (error) {
		console.log(error);
		res.json({ status: "error", message: error.message });
	}
});

//admin login --- POST route
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.json({
			status: "error",
			message: "invalid email or passsword 1",
		});
	}

	const admin = await getAdminIdByEmail(email);

	const passFromDB = admin && admin._id ? admin.password : null;
	if (!passFromDB) {
		return res.json({
			status: "error",
			message: "invalid email or password 2",
		});
	}
	const result = await comparePassword(password, passFromDB);
	if (!result) {
		return res.json({
			status: "error",
			message: "invalid email or password 3",
		});
	}

	const accessJWT = await createAccessJWT(admin.email, `${admin._id}`);
	const refreshJWT = await createRefreshJWT(admin.email, `${admin._id}`);

	res.json({
		status: "success",
		message: "login successful",
		accessJWT,
		refreshJWT,
	});
});

module.exports = router;
