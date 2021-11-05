const express = require("express");
const router = express.Router();

const { hashPassword, comparePassword } = require("../helpers/bcrypt.helper");
const {
	createAccessJWT,
	createRefreshJWT4Employee,
} = require("../helpers/jwt.helper");
const {
	adminAuthorization,
	employeeAuthorization,
} = require("../middleware/Authorization.middleware");
const {
	adminSignupValidation,
} = require("../middleware/formValidation.middleware");

const {
	insertEmployee,
	getEmpByEmail,
} = require("../model/employee/Employee.model");

//only admin access can create employee
router.post(
	"/add-emp",
	adminSignupValidation,
	adminAuthorization,
	async (req, res) => {
		const { name, email, password, phone, dob, address } = req.body;
		try {
			const hashedPass = await hashPassword(password);
			const empObj = {
				name,
				email,
				password: hashedPass,
				phone,
				dob,
				address,
			};
			const result = await insertEmployee(empObj);
			res.json({ status: "success", message: "created employee", result });
		} catch (error) {
			console.log(error);
			res.json({ status: "error", message: error.message });
		}
	}
);

//employee login route
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// sv side check for null values
	if (!email || !password) {
		return res.json({ status: "error", message: "invalid email or password" });
	}
	//get employee from db using email
	const employee = await getEmpByEmail(email);
	//get hashed password from employee-
	//if employee is null get null value
	const hashedpassFromDB = employee && employee._id ? employee.password : null;
	if (!hashedpassFromDB) {
		return res.json({ status: "error", message: "invalid email or password" });
	}
	//comparison of password
	const result = await comparePassword(password, hashedpassFromDB);
	if (!result) {
		return res.json({
			status: "error",
			message: "failed to auth- invalid email or password",
		});
	}

	//create JWTs
	const accessJWT = await createAccessJWT(
		employee.email,
		employee._id.toString()
	);
	const refreshJWT = await createRefreshJWT4Employee(
		employee.email,
		`${employee._id}`
	);

	res.json({
		status: "success",
		message: "login successful",
		accessJWT,
		refreshJWT,
	});
});

//get employee home page
router.get("/", employeeAuthorization, async (req, res) => {
	try {
		const empProfile = req.empId;
		if (!empProfile) {
			return res.json({ status: "error", message: "invalid login" });
		}
		const { _id, name, email } = empProfile;
		res.json({ employee: _id, name, email });
	} catch (error) {
		res.json({ status: "error", message: error.message });
	}
});

module.exports = router;
