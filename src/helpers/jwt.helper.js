const jwt = require("jsonwebtoken");
const { setJWT } = require("./redis.helper");
const { storeUserRefreshJWT } = require("../model/user/User.model");
const { storeAdminRefreshJWT } = require("../model/admin/Admin.model");
const { storeEmpRefreshJWT } = require("../model/employee/Employee.model");

const createAccessJWT = async (email, _id) => {
	try {
		const accessJWT = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
			expiresIn: "15m",
		});
		await setJWT(accessJWT, _id);
		return Promise.resolve(accessJWT);
	} catch (error) {
		return Promise.reject(error);
	}
};

const createRefreshJWT = async (email, _id) => {
	try {
		const refreshJWT = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
			expiresIn: "30d",
		});
		await storeUserRefreshJWT(_id, refreshJWT);
		return Promise.resolve(refreshJWT);
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
};

const createRefreshJWT4admin = async (email, _id) => {
	try {
		const refreshJWT = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
			expiresIn: "1d",
		});
		await storeAdminRefreshJWT(_id, refreshJWT);
		return Promise.resolve(refreshJWT);
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
};

const createRefreshJWT4Employee = async (email, _id) => {
	try {
		const refreshJWT = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
			expiresIn: "1d",
		});
		await storeEmpRefreshJWT(_id, refreshJWT);
		return Promise.resolve(refreshJWT);
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
};

const verifyAccessJWT = (userJWT) => {
	try {
		return Promise.resolve(jwt.verify(userJWT, process.env.JWT_ACCESS_SECRET));
	} catch (error) {
		return Promise.reject(error);
	}
};

const verifyRefreshJWT = (userJWT) => {
	try {
		return Promise.resolve(jwt.verify(userJWT, process.env.JWT_REFRESH_SECRET));
	} catch (error) {
		return Promise.resolve(error);
	}
};

module.exports = {
	createAccessJWT,
	createRefreshJWT,
	verifyAccessJWT,
	verifyRefreshJWT,
	createRefreshJWT4admin,
	createRefreshJWT4Employee,
};
