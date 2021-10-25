const { ResetPinSchema } = require("./ResetPin.schema");
const { randomPinNumber } = require("../../utils/randomNumberGenerator");

//create and store pin in new db collections
const setPasswordResetPin = async (email) => {
	const pinLength = process.env.NUM_PIN_DIG;
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

//return a promised pin using email
const getPinByEmailPin = (email, pin) => {
	return new Promise((resolve, reject) => {
		try {
			ResetPinSchema.findOne({ email, pin }, (error, data) => {
				if (error) {
					console.log(error);
					resolve(false);
				}
				resolve(data);
			});
		} catch (error) {
			reject(error);
			console.log(error);
		}
	});
};

//delete pin once used for authentication
const deletePin = (email, pin) => {
	try {
		ResetPinSchema.findOneAndDelete({ email, pin }, (error) => {
			if (error) {
				console.log(error);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	setPasswordResetPin,
	getPinByEmailPin,
	deletePin,
};
