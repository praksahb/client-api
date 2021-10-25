const Joi = require("joi");

const schema = Joi.object({
	name: Joi.string().min(3),
	phone: Joi.number().min(1000000000).max(9999999999),
	email: Joi.string().email({
		minDomainSegments: 2,
		tlds: { allow: ["com", "net"] },
	}),
	password: Joi.string().min(3).max(30),
	newPassword: Joi.string().alphanum().min(3).max(30),
	company: Joi.string().min(5).max(60),
	address: Joi.string().min(5).max(100),
	pin: Joi.string().min(6).max(6),
});

const signUpDataValidation = (req, res, next) => {
	//function to check sign- up details validation

	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const emailValidation = (req, res, next) => {
	//function to check if valid email;

	const value = schema.validate(req.body);
	if (value.error) {
		return res.json({ status: "error", message: value.error.message });
	}
	next();
};

const updatePassReqValidation = (req, res, next) => {
	//middleware function to validate dataObj if in valid data format before resetting password with newPassword

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
};
