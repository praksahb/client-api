const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	//sending and receiving addresses for email
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "emilio.streich35@ethereal.email",
		pass: "KQgwy72HXApMcFDZY8",
	},
});

const send = (info) => {
	return new Promise(async (resolve, reject) => {
		try {
			// send mail with defined transport object
			let result = await transporter.sendMail(info);
			console.log("Message sent: %s", result.messageId);

			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

			// Preview only available when sending through an Ethereal account
			console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));
			// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
			resolve(result);
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

const emailProcessor = ({ email, pin, type, verificationLink = "" }) => {
	//email body - function to send info to email
	let emailInfo = "";
	switch (type) {
		case "request-new-password":
			emailInfo = {
				from: '"CRM Company" <emilio.streich35@ethereal.email>', // sender address
				to: email, // list of receivers
				subject: "Password reset Pin", // Subject line
				text:
					"Here is your password reset pin" +
					pin +
					"This pin will expire in 1 day", // plain text body
				html: `<b>Hello </b>
          <p>Here is your pin
          <bold>${pin}</bold>
          This pin will expire in one day</p>`, // html body
			};

			send(emailInfo);
			break;
		case "password-update-success":
			emailInfo = {
				from: '"CRM Company" <abe.kohler59@ethereal.email>', // sender address
				to: email, // list of receivers
				subject: "Password updated", // Subject line
				text: "Your new password has been update", // plain text body
				html: `<b>Hello </b>
      				<p>Your new password has been update</p>`, // html body
			};
			send(emailInfo);
			break;
		case "new-user-confirmation-required":
			emailInfo = {
				from: '"CRM Company" <emilio.streich35@ethereal.email>', // sender address
				to: email, // list of receivers
				subject: "Please verify email, new user", // Subject line
				text: "Please follow the link to verify your account, once verified you can login access the account", // plain text body
				html: `<b>Hello </b>
          <p>Please follow the link to verify your account, once verified you can login access the account</p> 
					<p>${verificationLink}</p>`, // html body
			};
			send(emailInfo);
			break;
		case "new reply on ticket":
			emailInfo = {
				from: '"CRM Company" <abe.kohler59@ethereal.email>', // sender address
				to: email, // list of receivers
				subject: "A new reply on teh ticket", // Subject line
				text: "A response regarding your ticket query has been posted", // plain text body
				html: `<b>Hello </b>
      				<p>A response regarding your ticket query has been posted</p>`, // html body
			};
			send(emailInfo);
			break;

		default:
			break;
	}
};

module.exports = { emailProcessor };
