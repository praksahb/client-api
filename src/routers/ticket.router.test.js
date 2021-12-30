const app = require("../../app");
const request = require("supertest");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../model/user/User.schema");
const Ticket = require("../model/ticket/Ticket.schema");

//initialize outside test loops to  avoid undefined error
let userObj = {};
let signupResponse, loginResponse, loginLandingPage;

beforeAll(async () => {
	const url = "mongodb://localhost/crm_ticket_system";
	await mongoose.connect(url);
});

beforeEach(async () => {
	userObj = {
		name: "Chota Lodha",
		company: "Lodha Pvt. Ltd",
		address: "102, arcade hall, lodha town, loda city, loda state",
		phone: 8007006000,
		email: "loda@mail.com",
		password: "loda321",
	};
	signupResponse = await request(app).post("/v1/user").send(userObj);
	const { email, password } = userObj;
	await User.findOneAndUpdate({ email }, { isVerified: true });
	loginResponse = await request(app)
		.post("/v1/user/login")
		.send({ email, password });
	loginLandingPage = await request(app)
		.get("/v1/user")
		.set("Authorization", loginResponse.body.accessJWT);
});

afterEach(async () => {
	await Ticket.deleteMany();
});

afterAll(async () => {
	await User.deleteMany();
	await mongoose.connection.close();
});

describe("Create Ticket", () => {
	it("should create new ticket", async () => {
		const createTicket = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGENT SOS",
				sender: userObj.name,
				message: "Please respond immediately",
			})
			.set("authorization", loginResponse.body.accessJWT);
		const { email } = userObj;
		const ticket = await Ticket.find({ email });

		expect(createTicket.status).toBe(200);
		expect(createTicket.body.status).toBe("success");
		expect(createTicket.body.message).toBe("new ticket created successfully");
	});

	it("should redirect to login page if no authorization", async () => {
		const createTicket = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGent",
				sender: userObj.name,
				message: "Hello 321",
			})
			.set("authorization", "");
		expect(createTicket.redirect).toBe(true);
		expect(createTicket.status).toBe(302);
	});
});

describe("Listing existing tickets", () => {
	beforeEach(async () => {
		const createTicket = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGENT SOS",
				sender: userObj.name,
				message: "Please respond immediately",
			})
			.set("authorization", loginResponse.body.accessJWT);
		const createTicket2 = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGent",
				sender: userObj.name,
				message: "Hello 321",
			})
			.set("authorization", loginResponse.body.accessJWT);
	});

	it("should list all tickets", async () => {
		const getTicket = await request(app)
			.get("/v1/ticket")
			.set("authorization", loginResponse.body.accessJWT);
		expect(getTicket.body.result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					_id: expect.any(String),
					status: "pending response",
					openAt: expect.stringMatching("2021-12"),
					conversations: expect.arrayContaining([
						expect.objectContaining({
							_id: expect.any(String),
							sender: expect.any(String),
							message: expect.any(String),
							msgAt: expect.any(String),
							message: expect.any(String),
						}),
					]),
				}),
			])
		);
	});

	it("should list a specific ticket by id", async () => {
		const getTicket = await request(app)
			.get("/v1/ticket")
			.set("authorization", loginResponse.body.accessJWT);

		const getOneTicket = await request(app)
			.get("/v1/ticket/" + getTicket.body.result[0]._id)
			.set("authorization", loginResponse.body.accessJWT);
		console.log(getOneTicket.body);
		expect(getOneTicket.body.status).toBe("success");
		expect(getOneTicket.status).toBe(200);
	});
});

describe("Update Ticket", () => {
	let ticketId, getTicket;
	beforeEach(async () => {
		const createTicket = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGENT SOS",
				sender: userObj.name,
				message: "Please respond immediately",
			})
			.set("authorization", loginResponse.body.accessJWT);
		const createTicket2 = await request(app)
			.post("/v1/ticket")
			.send({
				subject: "URGent",
				sender: userObj.name,
				message: "Hello 321",
			})
			.set("authorization", loginResponse.body.accessJWT);

		getTicket = await request(app)
			.get("/v1/ticket")
			.set("authorization", loginResponse.body.accessJWT);
		ticketId = getTicket.body.result[0]._id;
		clientId = getTicket.body.result[0].clientId;
	});

	it("should add reply to ticket", async () => {
		const addReplyTicket = await request(app)
			.put("/v1/ticket/" + ticketId)
			.send({
				sender: userObj.name,
				message: "2nd message reply to first message",
			})
			.set("authorization", loginResponse.body.accessJWT);
		console.log(addReplyTicket.body);
		const getSpecificTicket = await request(app)
			.get("/v1/ticket/" + ticketId)
			.set("authorization", loginResponse.body.accessJWT);
		expect(getSpecificTicket.body.result.conversations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					message: "2nd message reply to first message",
				}),
			])
		);
		expect(getSpecificTicket.body.result.conversations[1].message).toBe(
			"2nd message reply to first message"
		);
	});

	it("should close ticket", async () => {
		const closeTicket = await request(app)
			.patch("/v1/ticket/close-ticket/" + ticketId)
			.set("authorization", loginResponse.body.accessJWT);
		console.log(closeTicket.body);
		expect(closeTicket.body.status).toBe("success");
		expect(closeTicket.body.message).toBe("The ticket has been closed");

		const getATicket = await Ticket.findById(ticketId);
		expect(getATicket.status).toBe("Closed");
	});

	it("should delete ticket", async () => {
		const ticketBeforeDeleting = await Ticket.findById(ticketId);
		expect(ticketBeforeDeleting).toBeTruthy;
		const deleteTicket = await request(app)
			.delete("/v1/ticket/" + ticketId)
			.set("authorization", loginResponse.body.accessJWT);
		const ticket = await Ticket.findById({ _id: ticketId });
		expect(ticket).toBeFalsy();
	});
});
