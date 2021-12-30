require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
// const port = process.env.PORT || 3001;
const mongoose = require('mongoose');

//API security
//app.use(helmet());

//handle CORS security
app.use(cors());
//middlewares
//parse url-encoded bodies
app.use(express.static(path.join(__dirname, '/src/public')));
app.use(express.json());
app.use(cookieParser());
//MongoDB connection- mongoose
const run = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);
		if (process.env.NODE_ENV !== 'production') {
			const mDb = mongoose.connection;
			mDb.on('open', () => {
				console.log('MongoDb is connected');
			});
			mDb.on('error', (error) => {
				console.log(error);
			});
		}
	} catch (error) {
		console.log(error);
		await mongoose.disconnect();
	}
};

run();

//logger
app.use(morgan('tiny'));

//view engine
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');

//load routers
const userRouter = require('./src/routers/user.router');
const ticketRouter = require('./src/routers/ticket.router');
const tokenRouter = require('./src/routers/token.router');
const adminRouter = require('./src/routers/admin.router');
const employeeRouter = require('./src/routers/employee.router');
const adminBroRouter = require('./src/routers/adminBro.router');
//use Router
app.use('/v1/user', userRouter);
app.use('/v1/ticket', ticketRouter);
app.use('/v1/tokens', tokenRouter);
app.use('/v1/admin', adminRouter);
app.use('/v1/employee', employeeRouter);
app.use('/admin', adminBroRouter);

app.use
// app.use("/", (req, res) => {
// 	res.render("home");
// });

//error handler
const handleError = require('./src/utils/errorHandler');

app.use((req, res, next) => {
	const error = new Error('Resource not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	handleError(error, res);
});
// app.listen(port, () => {
// 	console.log(`API is ready on http://localhost:${port}`);
// });

module.exports = app;
