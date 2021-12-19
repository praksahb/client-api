const app = require('./app');
const port = process.env.PORT || 3001;

app.listen(port, () => {
	console.log(`API is ready on http://localhost:${port}`);
});
