const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
	clientId: {
		type: Schema.Types.ObjectId,
	},
	workedById: {
		type: Schema.Types.ObjectId,
	},
	subject: {
		type: String,
		maxLength: 100,
		required: true,
		default: "",
	},
	openAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},

	status: {
		type: String,
		maxLength: 40,
		required: true,
		default: "pending response",
	},
	conversations: [
		{
			sender: {
				type: String,
				maxLength: 50,
				required: true,
				default: "",
			},
			message: {
				type: String,
				maxLength: 1000,
				required: true,
				default: "",
			},
			msgAt: {
				type: Date,
				required: true,
				default: Date.now(),
			},
		},
	],
});

module.exports = {
	TicketSchema: mongoose.model("Ticket", TicketSchema),
};
