const { ResetPinSchema } = require("./ResetPin.schema");
const { randomPinNumber } = require("../../utils/randomGenerator");

const setPasswordResetPin = async (email) => {
	//raqndom 6 digit pin
	const pinLength = 6;
	const randomPin = await randomPinNumber(pinLength);

	const resetObj = {
		email,
		pin: randomPin,
	};

	return new Promise((resolve, reject) => {
		ResetPinSchema(resetObj)
			.save()
			.then((data) => resolve(data))
			.catch((error) => reject(error));
	});
};

module.exports = {
	setPasswordResetPin,
};
