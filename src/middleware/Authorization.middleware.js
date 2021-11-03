const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");
const { getAdminById } = require("../model/admin/Admin.model");

const userAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;
	//1. verfiy if jwt is valid
	const decoded = await verifyAccessJWT(authorization);
	//console.log("decoded: ", decoded);
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
	// 	const adminId = req.userId;
	// 	const checkId = await getAdminById(adminId);
	// 	//console.log("checkID: ", checkId);
	// 	if (!checkId) {
	// 		return res
	// 			.status(403)
	// 			.json({ message: "forbidden failed to authenticate" });
	// 	}
	// 	if (checkId.role === "employee" || checkId.role === "admin") {
	// 		req.employee = checkId;
	// 		return next();
	// 	}
	// 	return res.status(403).json({ message: "forbidden authentication failure" });
};

const adminAuthorization = async (req, res, next) => {
	const adminId = req.userId;
	const checkId = await getAdminById(adminId);
	//console.log("checkID: ", checkId);
	if (!checkId) {
		return res
			.status(403)
			.json({ message: "forbidden failed to authenticate" });
	}
	// if (checkId.role === "admin") {
	req.admin = checkId;
	return next();
	// }
	return res.status(403).json({ message: "forbidden authentication failure" });
};

module.exports = {
	userAuthorization,
	employeeAuthorization,
	adminAuthorization,
};
