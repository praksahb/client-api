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

const getTickets = (clientId) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.find({ clientId })
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

const getTicketById = (_id, clientId) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOne({ _id, clientId })
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

const addTicketReply = ({ _id, clientId, message, sender }) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOneAndUpdate(
				{ _id, clientId },
				{
					status: "pending operator response",
					$push: {
						conversations: { message, sender },
					},
				},
				{ new: true }
			)
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

const updateStatusToClose = ({ _id, clientId }) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOneAndUpdate(
				{ _id, clientId },
				{
					status: "Closed",
				},
				{ new: true }
			)
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

const deleteTicket = ({ _id, clientId }) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOneAndDelete({ _id, clientId })
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
	getTickets,
	getTicketById,
	addTicketReply,
	updateStatusToClose,
	deleteTicket,
};
