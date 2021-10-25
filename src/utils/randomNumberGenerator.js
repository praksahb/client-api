const randomPinNumber = (length) => {
	//type string- reason- string concatenation
	let pin = "";

	for (let i = 0; i < length; i++) {
		pin += Math.floor(Math.random() * 10);
	}
	return pin;
};
module.exports = { randomPinNumber };
