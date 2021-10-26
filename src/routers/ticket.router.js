const express = require("express");
const { userAuthorization } = require("../middleware/Authorization.middleware");
const router = express.Router();
const {
	insertTicket,
	getTickets,
	getTicketById,
	addTicketReply,
	updateStatusToClose,
	deleteTicket,
} = require("../model/ticket/Ticket.model");

//Workflow--
//authorize every request with jwt
//retreive all the ticket for the specific user
//retreive a ticket from mongodb
//update message conversation in the ticket database
//update ticket status: close, operator response pending, client response pending
//delete ticket from mongodb

router.all("/", (req, res, next) => {
	// res.json({ message: "Return from ticket router" });
	next();
});

//create new ticket
router.post("/", userAuthorization, async (req, res) => {
	//receive new ticket data
	try {
		const { subject, sender, message } = req.body;

		const userId = req.userId;
		const ticketObj = {
			clientId: userId, //TODO get clientID from using accessjwt
			subject,
			conversations: [
				{
					sender,
					message,
				},
			],
		};

		//insert ticket in mongodb
		const result = await insertTicket(ticketObj);
		if (result._id) {
			return res.json({
				status: "success",
				message: "new ticket created successfully",
			});
		}
		res.json({
			status: "error",
			message: "Unable to create the ticket, please try again later",
		});
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

///GET all tickets for a specific user
router.get("/", userAuthorization, async (req, res) => {
	//receive new ticket data
	try {
		const userId = req.userId;

		const result = await getTickets(userId);

		return res.json({
			status: "success",
			result,
		});
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//get a specific ticket
router.get("/:_id", userAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		const clientId = req.userId;

		const result = await getTicketById(_id, clientId);

		return res.json({ status: "success", result });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//Update a specific ticket - allows client to add reply to the ticket
router.put("/:_id", userAuthorization, async (req, res) => {
	try {
		const { message, sender } = req.body;
		const { _id } = req.params;
		const clientId = req.userId;

		const result = await addTicketReply({ _id, clientId, message, sender });

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
});

//Update ticket status to close
router.patch("/close-ticket/:_id", userAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		const clientId = req.userId;

		const result = await updateStatusToClose({ _id, clientId });

		if (result._id) {
			return res.json({
				status: "success",
				message: "The ticket has been closed",
			});
		}

		res.json({ status: "error", message: "unable to update message" });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

//DELETE ticket
router.delete("/:_id", userAuthorization, async (req, res) => {
	try {
		const { _id } = req.params;
		const clientId = req.userId;

		const result = await deleteTicket({ _id, clientId });

		if (result._id) {
			return res.json({
				status: "success",
				message: "The ticket has been deleted forever",
			});
		}
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

module.exports = router;
