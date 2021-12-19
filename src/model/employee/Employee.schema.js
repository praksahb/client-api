const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const EmployeeSchema = new Schema({
	name: {
		type: String,
		maxlength: 50,
		required: true,
	},
	email: {
		type: String,
		maxlength: 50,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		minlength: 12,
		maxlength: 100,
		required: true,
	},
	role: {
		type: [
			{
				type: String,
				enum: ["employee", "admin"],
			},
		],
		default: ["employee"],
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
});

//function called after doc is saved to db
EmployeeSchema.post("save", (doc, next) => {
	console.log("new employee created and saved", doc);
	next();
});

//function will run before document is saved to db
EmployeeSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

//static method to login
EmployeeSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error("incorrect password");
	}
	throw Error("incorrect email");
};

module.exports = mongoose.model("Employee", EmployeeSchema);
