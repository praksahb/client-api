const { verifyAccessJWT } = require("../helpers/jwt.helper");
const { getJWT, deleteJWT } = require("../helpers/redis.helper");

const userAuthorization = async (req, res, next) => {
	const { authorization } = req.headers;
	//console.log(authorization);

	//1. verfiy if jwt is valid
	const decoded = await verifyAccessJWT(authorization);
	console.log(decoded);
	if (decoded.email) {
		//2. check if jwt exists in redis
		const userId = await getJWT(authorization);
		console.log(userId);
		if (!userId) {
			return res.status(404).json({ message: "forbidden" });
		}
		//send id to user.router for steps 3 and 4
		req.userId = userId;
		return next();
	}

	deleteJWT(authorization);
	return res.status(404).json({ message: "forbidden" });
};

module.exports = {
	userAuthorization,
};
