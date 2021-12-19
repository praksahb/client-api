const {
	insertUser,
	getUserByEmail,
	getUserById,
	updatePassword,
	storeUserRefreshJWT,
	verifyUser,
} = require("../model/user/User.model");

const User = require("../model/user/User.schema");

const {
	hashPassword,
	comparePassword,
} = require("../../src/helpers/bcrypt.helper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middleware/Authorization.middleware");
const {
	setPasswordResetPin,
	getPinByEmailPin,
	deletePin,
} = require("../model/resetPin/ResetPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const {
	emailValidation,
	updatePassReqValidation,
	signUpDataValidation,
} = require("../middleware/formValidation.middleware");
const { deleteJWT } = require("../helpers/redis.helper");

const mongoose = require("mongoose");

jest.setTimeout(60000);

describe("Create User- Client process", () => {
	let userObj;
	beforeAll(() => {
		userObj = {
			name: "Bhaskar Pal",
			company: "Lodha Pvt. Ltd",
			address: "102, arcade hall, lodha town, loda city, loda state",
			phone: 8007006000,
			email: "loda@mail.com",
			password: "loda321",
		};
	});

	it("hash password using bcrypt function", async () => {
		const { password } = userObj;
		const hashedPass = await hashPassword(password);
		userObj.password = hashedPass;

		expect(userObj.password).toBeDefined();
	});

	it("Saves userObj to database", async () => {
		const result = await User.create(userObj);
	});
});
