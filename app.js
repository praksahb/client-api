require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.PORT || 3001;

//API security
//app.use(helmet());

//handle CORS security
app.use(cors());

//MongoDB connection- mongoose
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

if (process.env.NODE_ENV !== "production") {
	const mDb = mongoose.connection;
	mDb.on("open", () => {
		console.log("MongoDb is connected");
	});
	mDb.on("error", (error) => {
		console.log(error);
	});

	//logger
	app.use(morgan("tiny"));
}
//parse url-encoded bodies
app.use(express.json());

//load routers
const userRouter = require("./src/routers/user.router");
const ticketRouter = require("./src/routers/ticket.router");
const tokenRouter = require("./src/routers/token.router");
const adminRouter = require("./src/routers/admin.router");
const employeeRouter = require("./src/routers/employee.router");

//use Router
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokenRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/employee", employeeRouter);

//error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
	const error = new Error("Resource not found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	handleError(error, res);
});

app.listen(port, () => {
	console.log(`API is ready on http://localhost:${port}`);
});
