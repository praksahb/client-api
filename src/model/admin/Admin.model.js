const AdminSchema = require("./Admin.schema");

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

const getAdminById = (_id) => {
	return new Promise((resolve, reject) => {
		if (!_id) return false;

		try {
			AdminSchema.findById(_id, (error, data) => {
				if (error) {
					console.log(error);
					reject(error);
				}
				resolve(data);
			});
		} catch (error) {
			reject(error);
		}
	});
};

const storeAdminRefreshJWT = (_id, token) => {
	return new Promise((resolve, reject) => {
		try {
			AdminSchema.findOneAndUpdate(
				{ _id },
				{
					$set: { "refreshJWT.token": token, "refreshJWT.addedAt": Date.now() },
				},
				{ new: true }
			)
				.then((data) => resolve(data))
				.catch((error) => {
					console.log(error);
					reject(error);
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
	getAdminById,
	storeAdminRefreshJWT,
};
