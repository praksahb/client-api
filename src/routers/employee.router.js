const express = require("express");
const {
	employee_login_post,
	employee_signup_post,
} = require("../controllers/authControllers");
const router = express.Router();

const { emailProcessor } = require("../helpers/email.helper");

const {
	adminAuthorization,
	employeeAuthorization,
} = require("../middleware/Authorization.middleware");
const {
	adminSignupValidation,
	replyTicketMessageValidationFromEmployee,
} = require("../middleware/formValidation.middleware");

const {
	getTickets4Emp,
	addTicketReply4Emp,
	getAllTicketsByStatus,
	addEmpOnTicket,
	getTicketById2,
} = require("../model/ticket/Ticket.model");

const { getUserById } = require("../model/user/User.model");

router.get("/signup", (req, res) => res.render("signup"));
// create employee
router.post("/signup", employee_signup_post);

router.get("/login", (req, res) => res.render("login"));
//employee login route
router.post("/login", employee_login_post);

//get employee home page
router.get("/", employeeAuthorization, async (req, res) => {
	try {
		const { _id, name, email } = req.empId;
		const result = await getTickets4Emp(_id);

		res.render("emp-home", { result, employee: { _id, name, email } });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//view all tickets with status= pending operator response,
//will point to all tickets recently created, which dont have workedById values
router.get("/open-tickets", employeeAuthorization, async (req, res) => {
	try {
		const status = "pending operator response";
		const result = await getAllTicketsByStatus(status);
		res.render("ticket-list", { result });
	} catch (error) {
		console.log(error);
	}
});

//get all tickets assigned to employee
router.get("/tickets", employeeAuthorization, async (req, res) => {
	try {
		//destructure id from employee info received from empAuth
		const { _id } = req.empId;
		//fetch tickets using id assigned to tickets under workedById
		const result = await getTickets4Emp(_id);
		return res.json({ status: "success", result });
	} catch (error) {
		console.log(error);
		res.json({ status: "error", message: error.message });
	}
});

//view tickets -- from open tickets page
router.get("/ticket/:_id", employeeAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		const result = await getTicketById2(_id);

		if (result) {
			return res.render("ticket-page", { result });
		}
		res.json({ status: "error", message: "invalid ticket id" });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

// **PUT request ideally** employee assign ticket to self
router.get("/assign-ticket/:_id", employeeAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		const workedById = req.empId._id;
		const result = await addEmpOnTicket({ _id, workedById });
		if (result) {
			res.redirect("/v1/employee");
		}
		res.json({ status: "error", message: "unable to add emp to ticket" });
	} catch (error) {
		console.log(error);
	}
});

//view & edit tickets
router.get("/work-ticket/:_id", employeeAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;

		// const employee = req.empId;
		// console.log("EMPlOYEE: ", employee);
		//employee already passed inside res.locals.user
		//can be accessed in rendered page using user

		const result = await getTicketById2(_id);
		if (result) {
			const { clientId } = result;
			const clientUser = await getUserById(clientId);
			if (clientUser) {
				return res.render("edit-ticket-page", { result, clientUser });
			}
			res.json({ status: "error", message: "ticket has no owner" });
		}
		res.json({ status: "error", message: "invalid ticket id" });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//add reply to ticket route-- send email to client on reply as well
router.put(
	"/work-ticket/:_id",
	replyTicketMessageValidationFromEmployee,
	employeeAuthorization,
	async (req, res) => {
		try {
			//get ticket id from url params
			const { _id } = req.params;
			//get message from req.body
			const { message } = req.body;
			//console.log(_id, message);
			//get sender and workedById from employee obj from employeeAuthroization
			const workedById = req.empId._id;
			const sender = req.empId.name;
			console.log(workedById, sender);
			//send data to ticket.model function to add reply
			const result = await addTicketReply4Emp({
				_id,
				workedById,
				message,
				sender,
			});
			console.log("result:: ", result);
			if (result && result._id) {
				//get email of client user
				const { clientId } = result;
				const { email } = await getUserById(clientId);
				// //send email regarding response posted
				await emailProcessor({ email, type: "new reply on ticket" });

				return res.json({
					status: "success",
					message: "message added successfully",
				});
			}
			res.json({ status: "error", message: "unable to add message/reply" });
		} catch (error) {
			res.json({ status: "error", message: error.message });
		}
	}
);

//update own (employee) information

//logout employee user

module.exports = router;
