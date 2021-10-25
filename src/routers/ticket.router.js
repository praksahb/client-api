const express = require("express");
const router = express.Router();

//Workflow--
//create url endpoint
//receive new ticket data
//authorize every request with jwt
//insert in mongodb
//retreive all the ticket for the specific user
//retreive a ticket from mongodb
//update message conversation in the ticket database
//update ticket status: close, operator response pending, client response pending
//delete ticket from mongodb

router.all("/", (req, res, next) => {
	// res.json({ message: "Return from ticket router" });
	next();
});

module.exports = router;
