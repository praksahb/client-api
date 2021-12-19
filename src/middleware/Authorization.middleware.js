const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");
const { getAdminById } = require("../model/admin/Admin.model");
const { getEmpById } = require("../model/employee/Employee.model");
const { getUserById } = require("../model/user/User.model");

//change userAuthorization to clientAuthorization
//universal auth middleware for all signed in users
const userAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;
	//1. verfiy if jwt is valid
	const decoded = await verifyAccessJWT(authorization);
	//console.log("decoded: ", decoded);
	if (!decoded && !decoded.email) {
		deleteJWT(authorization);
		return res.status(403).json({ message: "forbidden - auth token invalid" });
	}
	//2. check if jwt exists in redis
	const redisValueId = await getJWT(authorization);

	if (!redisValueId) {
		return res
			.status(403)
			.json({ message: "forbidden - failure to authenticate" });
	}
	//check id in user--client db
	const clientId = await getUserById(redisValueId);
	if (!clientId) {
		return res.json({ status: "error", message: "forbidden auth" });
	}
	req.clientId = clientId;
	next();
};

//create NEW employee AUTH middleware
const employeeAuthorization = async (req, res, next) => {
	const authorization = req.cookies.accessJwt;
	//can use refreshJWT to generate a new accessJWT--- can try if time
	try {
		if (!authorization) {
			return res.redirect("/v1/employee/login");
		}
		const decoded = await verifyAccessJWT(authorization);
		if (!decoded && !decoded.email) {
			deleteJWT(authorization);
			res.locals.user = null;
			return res.json({
				status: "error",
				message: "forbidden invalid auth token",
			});
		}
		//verify auth token to get id
		const redisValueId = await getJWT(authorization);
		if (!redisValueId) {
			res.locals.user = null;
			return res.json({
				status: "error",
				message: "forbidden invalid auth token",
			});
		}
		//verify id in employee collections db
		const empId = await getEmpById(redisValueId);
		if (!empId) {
			res.locals.user = null;
			return res.json({ status: "error 403", message: "forbidden auth" });
		}
		res.locals.user = empId;
		req.empId = empId;
		next();
	} catch (error) {
		console.log(error);
	}
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
