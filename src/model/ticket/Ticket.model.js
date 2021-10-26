const { TicketSchema } = require("./Ticket.schema");

const insertTicket = (ticketObj) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema(ticketObj)
				.save()
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

module.exports = {
	insertTicket,
};
