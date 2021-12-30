const app = require("./app");

const {
	client,
	setJWT,
	getJWT,
	deleteJWT,
} = require("./src/helpers/redis.helper");

const mongoose = require("mongoose");

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
	// Closing the DB connection allows Jest to exit successfully.
	try {
		client.quit();
		await mongoose.connection.close();
	} catch (error) {
		console.log(error);
	}
});

describe("Test framework is working alright", () => {
	it("should two plus two is four", () => {
		expect(2 + 2).toBe(4);
	});
});

describe("redis 3.1.2 working without native promise support", () => {
	it("should create a key", async () => {
		await setJWT(1, 2);
		const keyReceived = await getJWT(1);
		expect(keyReceived).toBe("2");
	});
});
