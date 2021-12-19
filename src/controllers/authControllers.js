const {
	insertEmployee,
	getEmpByEmail,
} = require("../model/employee/Employee.model");

const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");

const {
	createAccessJWT,
	createRefreshJWT4Employee,
} = require("../helpers/jwt.helper");
const EmployeeSchema = require("../model/employee/Employee.schema");

module.exports.employee_login_post = async (req, res) => {
	try {
		const { email, password } = req.body;
		// sv side check for null values
		if (!email || !password) {
			return res.json({
				status: "error",
				message: "invalid email or password",
			});
		}

		const result = await EmployeeSchema.login(email, password);
		if (!result) {
			return res.json({
				status: "error",
				message: "failed to auth- invalid email or password",
			});
		}
		//create JWTs
		const accessJWT = await createAccessJWT(
			result.email,
			result._id.toString()
		);
		const refreshJWT = await createRefreshJWT4Employee(
			result.email,
			`${result._id}`
		);
		res.cookie("accessJwt", accessJWT, {
			httpOnly: true,
			maxAge: 15 * 60 * 1000,
		});
		res.json({
			status: "success",
			message: "login successful",
			result,
		});
	} catch (error) {
		console.log(error);
		res.json(error.message);
	}
};

module.exports.employee_signup_post = async (req, res) => {
	const { name, email, password, phone, dob, address } = req.body;

	try {
		const empObj = {
			name,
			email,
			password,
			phone,
			dob,
			address,
		};
		const user = await insertEmployee(empObj);
		res.json({ status: "success", message: "created employee", user });
	} catch (error) {
		console.log(error);
		res.json({ status: "error", message: error.message });
	}
};
