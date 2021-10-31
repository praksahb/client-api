const express = require("express");
const router = express.Router();

const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");

const {
	insertAdmin,
	getAdminIdByEmail,
	getAdminById,
	storeAdminRefreshJWT,
} = require("../model/admin/Admin.model");

const { getAllTicketsByStatus } = require("../model/ticket/Ticket.model");

const {
	adminSignupValidation,
} = require("../middleware/formValidation.middleware");
const { userAuthorization } = require("../middleware/Authorization.middleware");
const { deleteJWT } = require("../helpers/redis.helper");

//create one admin atleast --- POST route
router.post("/signup", adminSignupValidation, async (req, res) => {
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

//ADMIN AUTHENTICATION ROUTES
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

//get admin home page
router.get("/", userAuthorization, async (req, res) => {
	const _id = req.userId;
	const adminProfile = await getAdminById(_id);

	const { name, email } = adminProfile;

	res.json({ user: { _id, name, email } });
});

//manual logout delete request
router.delete("/logout", userAuthorization, async (req, res) => {
	const { authorization } = req.headers;

	console.log(req.userId);
	const _id = req.userId;

	deleteJWT(authorization);
	const result = await storeAdminRefreshJWT(_id, "");
	if (result._id) {
		return res.json({ status: "success", message: "logged out successfully" });
	}
});

//ADMIN  TICKETs ROUTES

//get all tickets according to status --- can be changed to get all ticekts by status
router.get("/find-tickets", userAuthorization, async (req, res) => {
	try {
		const { status } = req.body;

		const result = await getAllTicketsByStatus(status);
		return res.json({ status: "success", result });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

module.exports = router;
