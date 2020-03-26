// Modules
const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bodyParser = require('body-parser');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// App
const app = express()

// Local imports
const api = require('./api')

// Constants
const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1'
const SERVER_PORT = process.env.SERVER_PORT || '8080'

// Use modules
app.use(cors({ origin: true, credentials: true, }))
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(session({
	secret: 'nuvsusu9vrnu48',
	resave: true,
	saveUninitialized: true
}));

// Paths
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', api)

app.listen(SERVER_PORT, SERVER_HOST)
console.log(`Running on http://${SERVER_HOST}:${SERVER_PORT}`)
