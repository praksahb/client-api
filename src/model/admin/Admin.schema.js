const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
	name: {
		type: String,
		maxlength: 50,
		required: true,
	},
	email: {
		type: String,
		maxlength: 50,
		required: true,
	},
	password: {
		type: String,
		minlength: 12,
		maxlength: 100,
		required: true,
	},
	phone: {
		type: Number,
		maxlength: 10,
		required: true,
	},
	dob: {
		type: Date,
		required: true,
	},
	address: {
		type: String,
		required: true,
		maxlength: 100,
	},
	// adminRole: {
	// 	type: String,
	// 	default: "employee",
	// },
});

module.exports = {
	AdminSchema: mongoose.model("Admin", AdminSchema),
};
