var express = require('express'),
	api = require('./api'),
	session = require('express-session'),
    bodyParser = require('body-parser'),
    MongoStore = require('connect-mongo')(session),
	model = require('./model.js');

const app = express();

app.use(session({
	secret: 'bigboat',
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({
		mongooseConnection: model.connection
	})
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// parse application/json
app.use(bodyParser.json());

var sendIndex = function(req, res, next) {
	res.sendFile('index.html', {
		root: __dirname + '/public/'
	}, function(err) {
		if (err)
			next(err);
	});
}

app.use('/api', api);

app.use(/^\/$/, sendIndex);
app.use(/^\/project/, sendIndex);

app.use(express.static(__dirname + '/public'));

const run = async() => {
	await model.connect();
	console.log('db connected');

	app.listen(5566, function() {
		console.log('Example app listening on port 5566!');
	});
}

run();