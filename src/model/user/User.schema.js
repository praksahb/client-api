const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		maxLength: 50,
		required: true,
	},
	company: {
		type: String,
		maxLength: 50,
		required: true,
	},
	address: {
		type: String,
		maxLength: 100,
		required: true,
	},
	phone: {
		type: Number,
		maxLength: 10,
	},
	email: {
		type: String,
		maxLength: 50,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		minLength: 8,
		maxLength: 100,
		required: true,
	},
	refreshJWT: {
		token: {
			type: String,
			maxLength: 500,
			default: "",
		},
		addedAt: {
			type: Date,
			required: true,
			default: Date.now(),
		},
	},
	isVerified: {
		type: Boolean,
		required: true,
		default: false,
	},
});

module.exports = mongoose.model("User", UserSchema);
