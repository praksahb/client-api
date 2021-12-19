const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");

const mongoose = require("mongoose");

AdminBro.registerAdapter(AdminBroMongoose);

const Ticket = require("../model/ticket/Ticket.schema");
const User = require("../model/user/User.schema");
const Employee = require("../model/employee/Employee.schema");
const Admin = require("../model/admin/Admin.schema");

const contentNavigation = {
	name: "Ticketing System",
	icon: "Accessibility",
};

const adminBro = new AdminBro({
	branding: {
		companyName: "CRM Ticketing System",
	},
	resources: [
		{
			resource: Ticket,
			options: {
				navigation: contentNavigation,
				listProperties: [
					"subject",
					"clientId",
					"workedById",
					"openAt",
					"status",
					"conversations",
				],
			},
		},
		{
			resource: User,
			options: {
				navigation: contentNavigation,
				listProperties: ["name", "company", "email"],
			},
		},
		{
			resource: Employee,
			options: {
				navigation: contentNavigation,
				listProperties: ["name", "email", "_id"],
			},
		},
		{
			resource: Admin,
			options: {
				navigation: contentNavigation,
				listProperties: ["name", "email", "_id"],
			},
		},
	],
	rootPath: "/admin",
});

const ADMIN = {
	email: process.env.ADMIN_EMAIL || "admin",
	password: process.env.ADMIN_PASSWORD || "12345",
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
	cookieName: process.env.ADMIN_COOKIE_NAME || "admin-bro",
	cookiePassword:
		process.env.ADMIN_COOKIE_PASS ||
		"qlu3SE9vgIjLtyOjczw8Kr7WwpDJO8zPxUj9e4xna4WxvyqLbNM9j3NHfvHywQcy",
	authenticate: async (email, password) => {
		if (email === ADMIN.email && password === ADMIN.password) {
			return ADMIN;
		}
		return null;
	},
});

module.exports = router;
