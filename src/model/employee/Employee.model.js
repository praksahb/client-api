const EmployeeSchema = require("./Employee.schema");

const insertEmployee = (empObj) => {
	return new Promise((resolve, reject) => {
		EmployeeSchema(empObj)
			.save()
			.then((data) => resolve(data))
			.catch((error) => reject(error));
	});
};

const getEmpByEmail = (email) => {
	return new Promise((resolve, reject) => {
		if (!email) return false;

		try {
			EmployeeSchema.findOne({ email }, (error, data) => {
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

const getEmpById = (_id) => {
	return new Promise((resolve, reject) => {
		if (!_id) return false;

		try {
			EmployeeSchema.findById(_id, (error, data) => {
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

const storeEmpRefreshJWT = (_id, token) => {
	return new Promise((resolve, reject) => {
		try {
			EmployeeSchema.findOneAndUpdate(
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

//admin method?
const getAllEmp4Admin = () => {
	return new Promise((resolve, reject) => {
		try {
			EmployeeSchema.find({})
				.then((data) => resolve(data))
				.catch((error) => reject(error));
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = {
	insertEmployee,
	getEmpByEmail,
	getEmpById,
	storeEmpRefreshJWT,
	getAllEmp4Admin,
};
