const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");
const { getAdminById } = require("../model/admin/Admin.model");
const { getEmpById } = require("../model/employee/Employee.model");

//change userAuthorization to clientAuthorization
//universal auth middleware for all signed in users
const userAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;
	//1. verfiy if jwt is valid
	const decoded = await verifyAccessJWT(authorization);
	console.log("decoded: ", decoded);
	if (decoded.email) {
		//2. check if jwt exists in redis
		const userId = await getJWT(authorization);
		//console.log(userId);
		if (!userId) {
			return res
				.status(403)
				.json({ message: "forbidden - failure to authenticate" });
		}
		//send id to req for further use//validation//etc
		req.userId = userId;
		return next();
	}
	//change if logic so that next() is called at end of middleware
	// instead of returning--
	deleteJWT(authorization);
	return res.status(403).json({ message: "forbidden - auth failed" });
};

//create NEW employee AUTH middleware
const employeeAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;

	const decoded = await verifyAccessJWT(authorization);
	if (!decoded && !decoded.email) {
		deleteJWT(authorization);
		return res.json({
			status: "error",
			message: "forbidden invalid auth token",
		});
	}
	//verify auth token to get id
	const redisValueId = await getJWT(authorization);
	if (!redisValueId) {
		return res.json({
			status: "error",
			message: "forbidden invalid auth token",
		});
	}
	//verify id in employee collections db
	const empId = await getEmpById(redisValueId);

	if (!empId) {
		return res.json({ status: "error 403", message: "forbidden auth" });
	}
	req.empId = empId;
	next();
};

//not required maybe, as performing same function as get request
//to get admin details from id provided
const adminAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;
	//verify jwt
	const decoded = await verifyAccessJWT(authorization);
	if (!decoded.email) {
		deleteJWT(authorization);
		return res
			.status(403)
			.json({ message: "forbidden- invalid authentication" });
	}
	//verify _id
	const redisValueId = await getJWT(authorization);
	if (!redisValueId) {
		return res.status(403).json({ message: "forbidden" });
	}
	//verify id in admin db collection
	const adminId = await getAdminById(redisValueId);
	// console.log("checkID: ", adminId);
	if (!adminId) {
		return res
			.status(403)
			.json({ message: "forbidden failed to authenticate" });
	}
	//serve admin obj-returned  into req object
	req.adminId = adminId;
	next();
};

module.exports = {
	userAuthorization,
	employeeAuthorization,
	adminAuthorization,
};
