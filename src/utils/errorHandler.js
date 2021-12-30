const handleError = (error, res) => {
	//console.log(error);

	if (error.name === "JsonWebTokenError") {
		res.status(403).json({ status: "error", message: "invalid auth" });
	}

	if (error.name === "TokenExpiredError") {
		res.status(403).json({ status: "error", message: "expired auth" });
	}

	res.status(error.status || 500);
	res.json({
		message: error.message,
	});
};

module.exports = handleError;
