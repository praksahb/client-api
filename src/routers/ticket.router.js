const express = require("express");
const router = express.Router();
const { insertTicket } = require("../model/ticket/Ticket.model");

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
router.post("/", async (req, res) => {
	//receive new ticket data
	try {
		const { subject, sender, message } = req.body;

		const ticketObj = {
			clientId: "617610223eb594c2325bfc9f", //TODO get clientID from using accessjwt
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

module.exports = router;
