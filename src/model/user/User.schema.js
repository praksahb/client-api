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
		maxLength: 50,
	},
	email: {
		type: String,
		maxLength: 50,
		required: true,
	},
	password: {
		type: String,
		minLength: 8,
		maxLength: 100,
		required: true,
	},
});

module.exports = {
	UserSchema: mongoose.model("User", UserSchema),
};
