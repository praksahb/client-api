const express = require("express");
const router = express.Router();

const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const {
	createAccessJWT,
	createRefreshJWT4admin,
} = require("../helpers/jwt.helper");

const {
	insertAdmin,
	getAdminIdByEmail,
	getAdminById,
	storeAdminRefreshJWT,
} = require("../model/admin/Admin.model");

const {
	getAllTicketsByStatus,
	getAllTickets4admin,
	addTicketReplyFromAdmin,
	addEmpOnTicket,
} = require("../model/ticket/Ticket.model");

const {
	adminSignupValidation,
	replyTicketMessageValidationFromEmployee,
} = require("../middleware/formValidation.middleware");
const {
	userAuthorization,
	adminAuthorization,
} = require("../middleware/Authorization.middleware");
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
	const refreshJWT = await createRefreshJWT4admin(admin.email, `${admin._id}`);

	res.json({
		status: "success",
		message: "login successful",
		accessJWT,
		refreshJWT,
	});
});

//get admin home page
router.get("/", adminAuthorization, async (req, res) => {
	try {
		const adminProfile = req.adminId;
		// console.log("adminProfile: ", adminProfile);
		if (!adminProfile) {
			return res
				.status(403)
				.json({ status: "error", message: "invalid login" });
		}
		const { _id, name, email } = adminProfile;
		res.json({ user: { _id, name, email } });
	} catch (error) {
		res.json({ status: "errror", message: error.message });
	}
});

//manual logout delete request
router.delete("/logout", userAuthorization, async (req, res) => {
	const { authorization } = req.headers;

	console.log(req.userId);
	const _id = req.userId;

	deleteJWT(authorization);
	const result = await storeAdminRefreshJWT(_id, "");
	console.log(result);
	if (result._id) {
		return res.json({ status: "success", message: "logged out successfully" });
	}
});

//ADMIN  TICKETs ROUTES

//get all tickets according to status
//can be changed to get all tickets by replies by admin id
router.get("/find-tickets", userAuthorization, async (req, res) => {
	try {
		const { status } = req.body;

		const result = await getAllTicketsByStatus(status);
		return res.json({ status: "success", result });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//get all tickets
router.get("/all-tickets", userAuthorization, async (req, res) => {
	try {
		const result = await getAllTickets4admin();
		return res.json({ status: "success", result });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//get all clients
//create method in user.model to fetch all users

//get all employees

//assign ticket to employee id--- add workedById to ticket
router.put("/all-tickets/:_id", userAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		console.log(req.employee);
		const workedById = req.employee._id;

		const result = await addEmpOnTicket({ _id, workedById });
		if (result._id) {
			return res.json({
				status: "success",
				message: "added employee to ticket",
			});
		}
		res.json({
			status: "error",
			message: "unable to add employee to ticket",
		});
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//update ticket --- send a reply resolution
//migrate function to employee router-- disallow admin to reply on tickets
router.put(
	"/ticket/:_id",
	replyTicketMessageValidationFromEmployee,
	userAuthorization,
	async (req, res) => {
		try {
			const { message } = req.body;
			const sender = req.employee.name;
			//const {sender: name} = req.employee;
			// console.log(sender);
			const { _id } = req.params;
			// console.log("ticket id: ", _id);
			const workedById = req.userId;
			// console.log("workerid: ", workedById);

			const result = await addTicketReplyFromAdmin({
				_id,
				workedById,
				message,
				sender,
			});
			console.log("result:", result);
			if (result._id) {
				return res.json({
					status: "success",
					message: "message updated successfully",
				});
			}
			res.json({ status: "error", message: "unable to update message" });
		} catch (error) {
			res.json({ status: "error", message: error.message });
		}
	}
);

//change ticket status to either awaiting response from client or closed

//whenever client replies on a closed ticket, ticket gets opened again

module.exports = router;
