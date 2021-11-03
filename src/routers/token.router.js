const express = require("express");
const router = express.Router();

const { verifyRefreshJWT, createAccessJWT } = require("../helpers/jwt.helper");
const { getAdminIdByEmail } = require("../model/admin/Admin.model");
const { getUserByEmail } = require("../model/user/User.model");

//return refresh token --- CLIENT
router.get("/client", async (req, res, next) => {
	const { authorization } = req.headers;

	//TODO
	//1.make sure the token is valid
	const decoded = await verifyRefreshJWT(authorization);
	if (decoded.email) {
		//2. check if the jwt is existing in users db collection
		const userProfile = await getUserByEmail(decoded.email);
		console.log("userProfile: ", userProfile);
		if (userProfile._id) {
			let tokenExpiryDate = userProfile.refreshJWT.addedAt;
			const dbRefreshToken = userProfile.refreshJWT.token;

			tokenExpiryDate = tokenExpiryDate.setDate(
				tokenExpiryDate.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
			);
			const todayDate = new Date();
			//3. check if it is not expired
			if (tokenExpiryDate < todayDate && dbRefreshToken !== authorization) {
				return res.json({ message: "forbidden refresh token expired" });
			}
			//create new access tokens for user
			const accessJWT = await createAccessJWT(
				decoded.email,
				userProfile._id.toString()
			);
			return res.json({ status: "success", accessJWT });
		}
	}

	return res.status(403).json({ message: "forbidden" });
});

//return accessJWT using refreshJWT --- ADMIN/employees
router.get("/admin", async (req, res, next) => {
	const { authorization } = req.headers;

	//TODO
	//1.make sure the token is valid
	const decoded = await verifyRefreshJWT(authorization);
	if (decoded.email) {
		//2. check if the jwt is existing in admin db collection
		const adminProfile = await getAdminIdByEmail(decoded.email);
		console.log("adminProfile: ", adminProfile);
		if (adminProfile._id) {
			let tokenExpiryDate = adminProfile.refreshJWT.addedAt;
			const dbRefreshToken = adminProfile.refreshJWT.token;

			tokenExpiryDate = tokenExpiryDate.setDate(
				tokenExpiryDate.getDate() +
					+process.env.JWT_REFRESH_SECRET_EXP_DAY_ADMIN
			);
			const todayDate = new Date();
			//3. check if it is not expired
			if (tokenExpiryDate < todayDate && dbRefreshToken !== authorization) {
				return res.json({ message: "forbidden refresh token expired" });
			}
			//create new access tokens for user/admin--- same function from jwt.helper
			const accessJWT = await createAccessJWT(
				decoded.email,
				adminProfile._id.toString()
			);
			return res.json({ status: "success", accessJWT });
		}
	}

	return res.status(403).json({ message: "forbidden" });
});

module.exports = router;
