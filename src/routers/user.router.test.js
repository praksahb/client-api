const app = require("../../app");
const request = require("supertest");

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

let userObj;
beforeAll(async () => {
	const url = "mongodb://localhost/crm_ticket_system";
	await mongoose.connect(url);
	userObj = {
		name: "Bhaskar Pal",
		company: "Lodha Pvt. Ltd",
		address: "102, arcade hall, lodha town, city, state",
		phone: 8007006000,
		email: "bhaskar@mail.com",
		password: "bhaskar321",
	};
});

afterEach(async () => {
	await User.deleteMany();
});

afterAll(async () => {
	// Removes the User collection
	// await User.deleteMany();
	await mongoose.connection.close();
});

describe("new user Signup - create new client user", () => {
	it("should check for new user signup successfully", async () => {
		const response = await request(app).post("/v1/user").send(userObj);
		expect(response.status).toBe(200);
		expect(response.body.status).toBe("success");
		const user = await getUserByEmail("loda@mail.com");
		expect(user.name).toBeTruthy();
		expect(user.email).toBeTruthy();
		expect(user.isVerified).not.toBeTruthy();
	});

	it("should send error message for duplicate email", async () => {
		const response = await request(app).post("/v1/user").send(userObj);
		const response2 = await request(app).post("/v1/user").send(userObj);
		expect(response2.statusCode).toBe(409);
		expect(response2.body.message).toBe("Email already exists");
	});
});

describe("login user client", () => {
	beforeEach(async () => {
		userObj = {
			name: "Bhaskar Pal",
			company: "Lodha Pvt. Ltd",
			address: "102, arcade hall, lodha town, city, state",
			phone: 8007006000,
			email: "bhaskar@mail.com",
			password: "bhaskar321",
		};
	});
	it("should send success for only valid & verifiedemail and password", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email, password });
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body.status).toBe("success");
	});

	it("should send error for  unverified email", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email, password });
		expect(loginResponse.status).toBe(401);
		expect(loginResponse.body.status).toBe("error");
		expect(loginResponse.body.message).toContain("verify acc first");
	});

	it("should check for null values", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email: "", password: "" });
		expect(loginResponse.status).toBe(400);
		expect(loginResponse.body.status).toBe("error");
		expect(loginResponse.body.message).toBe("Invalid form submission");
	});

	it("should send error for email not found", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email: "roger@mail.com", password: "roger321" });
		expect(loginResponse.status).toBe(400);
		expect(loginResponse.body.status).toBe("error");
		expect(loginResponse.body.message).toBe("user not found");
	});

	it("should send error for wrong password", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email: "bhaskar@mail.com", password: "roger321" });
		expect(loginResponse.status).toBe(400);
		expect(loginResponse.body.status).toBe("error");
		expect(loginResponse.body.message).toBe("invalid email or password");
	});
});

describe("user authentication & authorization", () => {
	beforeEach(async () => {
		userObj = {
			name: "Bhaskar Pal",
			company: "Lodha Pvt. Ltd",
			address: "102, arcade hall, lodha town, city, state",
			phone: 8007006000,
			email: "bhaskar@mail.com",
			password: "bhaskar321",
		};
	});

	it("get user profile page after login", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email, password });
		const loginLandingPage = await request(app)
			.get("/v1/user")
			.set("Authorization", loginResponse.body.accessJWT);
		expect(loginLandingPage.status).toBe(200);
		expect(loginLandingPage.body.user).toBeDefined();
		expect(loginLandingPage.body.user.email).toBe("bhaskar@mail.com");
	});

	it("403 error for wrong token", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email, password });
		const loginLandingPage = await request(app)
			.get("/v1/user")
			.set("authorization", "123");
		expect(loginLandingPage.status).toBe(403);
		//expect(loginLandingPage).rejects();
	});

	it("should 302 redirect for null token", async () => {
		const signupResponse = await request(app).post("/v1/user").send(userObj);
		const { email, password } = userObj;
		await User.findOneAndUpdate({ email }, { isVerified: true });
		const loginResponse = await request(app)
			.post("/v1/user/login")
			.send({ email, password });
		const loginLandingPage = await request(app)
			.get("/v1/user")
			.set("authorization", "");
		expect(loginLandingPage.status).toBe(302);
		expect(loginLandingPage.redirect).toBe(true);
	});
});

describe.skip("helper functions testing", () => {
	it("hash password using bcrypt function", async () => {
		const { password } = userObj;
		const hashedPass = await hashPassword(password);
		userObj.password = hashedPass;

		expect(userObj.password).toBeDefined();
	});

	it("Saves userObj to database", async () => {
		const result = await insertUser(userObj);
		expect(result.email).toBe(userObj.email);
		expect(result.name).toBe(userObj.name);
		expect(result).toMatchObject(userObj);
	});
});
