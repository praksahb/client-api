const redis = require("redis");

const redisPassword = process.env.REDIS_PASS;
const client = redis.createClient(process.env.REDIS_URI, {
	password: redisPassword,
});

client.on("error", (err) => {
	console.error(err);
});

// client.auth(redisPassword, (err) => {
//	if (err) console.log(err);
//});

const setJWT = (key, value) => {
	return new Promise((resolve, reject) => {
		try {
			client.set(key, value, (err, res) => {
				if (err) reject(err);
				resolve(res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

const getJWT = (key) => {
	return new Promise((resolve, reject) => {
		try {
			client.get(key, (err, res) => {
				if (err) reject(err);
				resolve(res);
			});
		} catch (err) {
			reject(err);
		}
	});
};

module.exports = {
	setJWT,
	getJWT,
};
