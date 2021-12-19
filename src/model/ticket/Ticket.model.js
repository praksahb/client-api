const TicketSchema = require("./Ticket.schema");

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

const getTicketById2 = (_id) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOne({ _id })
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

//ADMIN -- EMPLOYEE functions

//1. get tickets according to status--- better to call all tickets and
//handle by status in frontend using react
const getAllTicketsByStatus = (status) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.find({ status })
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};
//2. get all tickets
const getAllTickets4admin = () => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.find({})
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			//console.log(error);
			reject(error);
		}
	});
};

//ticket response change or create new for employee

const addEmpOnTicket = ({ _id, workedById }) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOneAndUpdate(
				{ _id },
				{ workedById, status: "worked on" },
				{ new: true }
			)
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

//Employee functions

//fetch all tickets for employee dashboard
const getTickets4Emp = (workedById) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.find({ workedById })
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			reject(error);
		}
	});
};

//remove admin from this function and add employee to it instead
const addTicketReply4Emp = ({ _id, workedById, message, sender }) => {
	return new Promise((resolve, reject) => {
		try {
			TicketSchema.findOneAndUpdate(
				{ _id, workedById },
				{
					status: "awaiting client response",
					$push: {
						conversations: { message, sender },
					},
				},
				{ new: true }
			)
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

module.exports = {
	insertTicket,
	getTickets,
	getTicketById,
	getTicketById2,
	addTicketReply,
	updateStatusToClose,
	deleteTicket,
	getAllTicketsByStatus,
	getAllTickets4admin,
	addEmpOnTicket,
	getTickets4Emp,
	addTicketReply4Emp,
};
