const Joi = require("joi");

const email = Joi.string()
	.email({
		minDomainSegments: 2,
		tlds: { allow: ["com", "net"] },
	})
	.required();
const pin = Joi.number().min(10000).max(999999).required();
const phone = Joi.number().min(1000000000).max(9999999999).required();
const newPassword = Joi.string().min(3).max(30).required();
const shortStr = Joi.string().min(2).max(50);
const longStr = Joi.string().min(2).max(1000);
const date = Joi.date();

const signUpDataValidation = (req, res, next) => {
	//function to check sign- up details validation
	const schema = Joi.object({
		name: shortStr.required(),
		company: shortStr.required(),
		address: longStr.required(),
		phone,
		email: email.required(),
		password: shortStr.required(),
	});

	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const emailValidation = (req, res, next) => {
	//function to check if valid email;
	const schema = Joi.object({ email });

	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const updatePassReqValidation = (req, res, next) => {
	//middleware function to validate dataObj if in valid data format before resetting password with newPassword
	const schema = Joi.object({
		email,
		pin,
		newPassword,
	});
	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const createNewTicketValidation = (req, res, next) => {
	const schema = Joi.object({
		subject: shortStr.required(),
		sender: shortStr.required(),
		message: longStr.required(),
		// issueDate: date.required(),
	});
	console.log(req.body);
	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const replyTicketMessageValidation = (req, res, next) => {
	const schema = Joi.object({
		sender: shortStr,
		message: longStr.required(),
	});
	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

//admin -- employee side valdiation

const adminSignupValidation = (req, res, next) => {
	const schema = Joi.object({
		name: shortStr.required(),
		email: email.required(),
		password: shortStr.required(),
		phone,
		dob: date.required(),
		address: longStr.required(),
	});
	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

module.exports = {
	emailValidation,
	updatePassReqValidation,
	signUpDataValidation,
	createNewTicketValidation,
	replyTicketMessageValidation,
	adminSignupValidation,
};
