const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetPinSchema = new Schema({
	pin: {
		type: String,
		minlength: 6,
		maxLength: 6,
	},
	email: {
		type: String,
		maxLength: 50,
		required: true,
	},
	addedAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});

module.exports = {
	ResetPinSchema: mongoose.model("Reset_pin", ResetPinSchema),
};
