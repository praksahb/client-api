const { AdminSchema } = require("./Admin.schema");

const insertAdmin = (adminObj) => {
	return new Promise((resolve, reject) => {
		AdminSchema(adminObj)
			.save()
			.then((data) => resolve(data))
			.catch((error) => reject(error));
	});
};

const getAdminIdByEmail = (email) => {
	return new Promise((resolve, reject) => {
		if (!email) return false;

		try {
			AdminSchema.findOne({ email }, (error, data) => {
				if (error) {
					console.log(error);
					reject(error);
				}
				//console.log(data);
				resolve(data);
			});
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

module.exports = {
	insertAdmin,
	getAdminIdByEmail,
};
