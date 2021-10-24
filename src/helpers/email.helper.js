const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
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
			//reject(error);
		}
	});
};

const emailProcessor = ({ email, pin, type }) => {
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
				from: '"CRM Company" <emilio.streich35@ethereal.email>', // sender address
				to: email, // list of receivers
				subject: "Password updated", // Subject line
				text: "Your new password has been updated", // plain text body
				html: `<b>Hello </b>
          <p>Your new password
          has been updated</p>`, // html body
			};

			send(emailInfo);
			break;

		default:
			break;
	}
};

module.exports = { emailProcessor };
