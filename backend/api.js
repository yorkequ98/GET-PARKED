// Modules
const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios');
const mysql = require('mysql');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const validator = require('validator');
const ses = require('node-ses');
const mailComposer = require("mailcomposer");
const client = ses.createClient({ key: 'AKIAIDZAZDOIX6KC6AQA', secret: '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'});
const handlebars = require('handlebars');
const pdf = require('html-pdf');
let date_ob = new Date();


// Constants
const DATABASE_HOST = process.env.DATABASE_HOST || '127.0.0.1';
const DATABASE_PORT = process.env.DATABASE_PORT || '3306';
const MYSQL_PASSWORD = process.env.MYSQL_ROOT_PASSWORD || 'mysql';
const SERVER_EMAIL = '906305065@qq.com';
const EMAIL_SUBJECT = "Welcome New Customer";
const CONTENT = "Dear Customer, thank you for signing up. Please find the agreement attached.";
const PDF_PATH = 'uploads/agreement.pdf';

// Response constants
const OK = 200;
const BAD_REQ = 400;
const UNAUTH = 401;  // unauthorized
const SERVER_ERR = 500;  // Internal server error

// Database
const connection = mysql.createConnection({
	host: DATABASE_HOST,
	port: DATABASE_PORT,
	user: "root",
	password: MYSQL_PASSWORD,
	database: 'nodelogin'
});

// File upload
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var email = req.headers.email;
		var splitEmail = email.split(".");
		var dir = "uploads/" + splitEmail[0] + splitEmail[1];
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		cb(null, dir + "/");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname) 
	}
  });
var upload = multer({ storage: storage });

// Email
function sendEmail(to, from, sub, msg, pdfPath) {
    mailComposer({
        from: from,
        to: to,
        subject: sub,
        text: msg,
        attachments: [
            {
                path: pdfPath
            },
        ],
    }).build((err, message) => {
        if (err) {
            console.error(`Email encoding error: ${err}`);
        }
        client.sendRawEmail(
            {
                from: from,
                rawMessage: message
            }, function (err, data, res) {
                if (err) {
                    console.error(`Email encoding error: ${err}`);
                }
            }
        )
    });
}

// pdf
function formatData(location, allocation, rate1,
				 net1, gst1, net2, gst2, total2,
				 total3, total4, date, fullname,
				 address, mobile, email) {
	const data = {
		location: location,
		allocation: allocation,
		rate1: rate1,
		net1: net1,
		gst1: gst1,
		net2: net2,
		gst2: gst2,
		total2: total2,
		total3: total3,
		total4: total4,
		date: date,
		fullname: fullname,
		address: address,
		mobile: mobile,
		email: email,
	};
	return data;
}

function sendPDF(parkId, email) {
	var query = "SELECT * FROM accounts WHERE email = ?";
	const date = getCurrentDate();
	connection.query(query, [email], function(error, results, fields) {
		if (error) {
			console.log(error);
		}
		if (results.length === 1) {
			var name = results[0].fullName;
			var mobile = results[0].mobile;
			var address = results[0].address;
			var parkquery = "SELECT * FROM `park` WHERE `id` = ?";
			connection.query(parkquery, [parkId], (error, results, field) => {
				if (error) {
					console.log(error);
					console.log("email not sent");
					return;
				}
				if (results.length === 0) {
					console.log(`in sendPDF: parkId ${parkId} did not exist. Not sent.`);
					return;
				}

				var street = results[0].street;
				var suburb = results[0].suburb;
				var rate1 = results[0].price;
				var allocation = results[0].bayNumber;
				var location = street.concat(", ").concat(suburb);
				var net1 = 0.9 * rate1;
				var gst1 = 0.1 * rate1;
				var net2 = Math.round((rate1 * 0.009) * 100) / 100;
				var gst2 = 0.001 * rate1;
				var total2 = rate1 * 0.01;
				var total3 = rate1 * 1.01;
				var total4 = rate1*1.01 + 30;
				var data = formatData(location, allocation, rate1,
					net1, gst1, net2, gst2, total2, total3,
					total4, date, name, address, mobile, email);
				console.log(data);

				const html = fs.readFileSync('agreement-temp.html', 'utf8');
				const template = handlebars.compile(html);
				const page = template(data);
				fs.writeFile('htmlfile.html', page, 'binary', function(err) {
					if (err) {
						console.log(err);
					}
				});
				const options = { format: 'Letter'};
				pdf.create(page, options).toFile(PDF_PATH, function(err, res) {
					if (err) {
						console.log(err);
						return;
					}
					sendEmail(email, SERVER_EMAIL, EMAIL_SUBJECT, CONTENT, PDF_PATH);
				});
			});
		}
	});
}
//sendPDF(4, 'yunke.qu@uq.net.au');

// Get date
function getCurrentDate() {
	let date = ("0" + date_ob.getDate()).slice(-2);
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	let year = date_ob.getFullYear();
	console.log(date + "/" + month + "/" + year);
	return date + "/" + month + "/" + year;
}

// Endpoints
router.get('/', (req, res) => {
	return res.send('Hello world!\n')
});

router.get('/session-test', function(req, res, next) {
	if (req.session.views) {
		req.session.views++;
		res.setHeader('Content-Type', 'text/html');
		res.write('<p>views: ' + req.session.views + '</p>');
		res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
		res.end()
	} else {
		req.session.views = 1;
		res.end('welcome to the session demo. refresh!');
		console.log(res.getHeaders())
	}
});

router.get("/is-logged-in", (req, res) => {
	if (req.session.loggedin) {
		res.sendStatus(OK);
	} else {
		res.sendStatus(UNAUTH);
	}
});

/**
 * Updates a user's name, company, mobile number and address. 
 * 	User must have an active session.
 */
router.post('/update', upload.single('license'), async (req, res) => {

	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var name = req.body.name;
	var company = req.body.company;
	var mobile = req.body.mobile;
	var address = req.body.address;
	var file = req.body.image;
	var email = req.session.email;
	var newEmail = req.body.email;
	
	// checking if request is valid
	if (name === undefined || company === undefined || mobile === undefined || address === undefined) {
		var message = "name, company, mobile, address must all be defined";
		return res.status(BAD_REQ).send(message);

	} else if (name === null || mobile === null) {
		var message = "name and mobile must not be null";
		return res.status(BAD_REQ).send(message);
	
	} else if (!checkFullName(name)) {
		return res.status(BAD_REQ).send("Invalid name");
	
	} else if (!checkMobile(mobile)) {
		return res.status(BAD_REQ).send("Invalid mobile");
	
	} 
	
	var dir;

	if (file != null) {
		var splitEmail = email.split('.');
		dir = "uploads/" + splitEmail[0] + splitEmail[1] + "/" + file;
	}

	// function to call once the queries below are finished
	var queryDone = (error, result) => {
		if (error) {
			console.log(error);
			return res.sendStatus(SERVER_ERR);
		} else {
			console.log("update query completed without errors!");
			res.sendStatus(OK);
		}
	};

	if (dir != null) {
		var query = "update accounts set businessName = ?, mobile = ?, address = ?, fullName = ?, license = ? where id = ?";
		connection.query(query, [company, mobile, address, name, dir, req.session.userId], queryDone);
	} else {
		var query = "update accounts set businessName = ?, mobile = ?, address = ?, fullName = ? where id = ?";
	    connection.query(query, [company, mobile, address, name, req.session.userId], queryDone);
	}
	
});

/**
 * Logs a user in with their email and password, which must be included 
 * 	as a JSON in the body of the request. If successful, creates a session
 * 	for the user and sends back a session cookie.
 */
router.post('/login', async (req, res) => {
	var email = req.body.email;
	var password = req.body.password;

	if (email && password) {
		var query = 'SELECT * FROM accounts WHERE email = ?';
		connection.query(query, [email], function(error, results, fields) {
			if (error) {
				return res.sendStatus(SERVER_ERR);  // query error
			}

			if (results.length > 0) { 	// email exists in the database 

				// verify password 
				if (bcrypt.compareSync(password, results[0].hash)) {
					// Password matches
					req.session.loggedin = true;
					req.session.email = email;
					req.session.userId = results[0].id;
					res.sendStatus(OK);
					return
				} else {
					res.sendStatus(UNAUTH);
				}

			} else {
				res.sendStatus(UNAUTH);
			}
				
			res.end();
		});

	} else {	// email and/or password was not provided
		res.sendStatus(BAD_REQ);
		res.end();
	}
});

/** 
 * Endpoint for logging out a user, which destroys their session. 
 * */
router.get('/logout', async (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.sendStatus(SERVER_ERR);
			return console.log(err);
		}
		res.send("You are logged out");
	})
});

/**
 * Check if password change is valid and if true, execute.
 */
router.post("/change-password", async (req, res) => {
	// if a session is active
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var oldPass = req.body.oldPass;
	var newPass = req.body.newPass;
	var newPassRepeat = req.body.newPassRepeat;

	if (newPass !== newPassRepeat) {
		return res.status(BAD_REQ).send("Both new passwords should match!");
	}

	if (!checkPassword(newPass, newPassRepeat)) {
		return res.status(BAD_REQ).send("Password must be 8-20 characters in length");
	}

	var email = req.session.email;

	query = "SELECT hash FROM accounts WHERE email = ?";
	connection.query(query, [email], (error, results) => {
		if (error) {
			console.log(error);
			return res.sendStatus(SERVER_ERR);  // query error
		}

		var oldHash = results[0].hash;
		if (!bcrypt.compareSync(oldPass, oldHash)) {
			// provided incorrect old password
			return res.status(BAD_REQ).send("Incorrect old password");
		}

		var newHash = bcrypt.hashSync(newPass, 10);
		var query = "UPDATE accounts SET hash = ? WHERE email = ?";
		connection.query(query, [newHash, email], (error, results) => {
			if (error) {
				console.log(error);
				return res.sendStatus(SERVER_ERR);
			}

			res.sendStatus(OK);
		})
	})
});

/**
 * Check if full name input is valid.
 * @param {String} fullName 
 */
function checkFullName(fullName) {
	var i = fullName.length;
	while (i--) {
	if (!(validator.isAlpha(fullName.charAt(i)) || fullName.charAt(i) == ' ' || fullName.charAt(i) == '-' || fullName.charAt(i) == "\'")) return false;
	}
	return true;
}

/**
 * Check if input is in a valid mobile number format.
 * @param {String} mobile 
 */
function checkMobile(mobile) {
	return (mobile != "" && validator.isMobilePhone(mobile));
}

/**
 * Check if email input is in a valid email format.
 * @param {String} email 
 */
function checkEmailFormat(email) {
	return (email != "" && validator.isEmail(email));
}

/**
 * Check if email input is already in the database.
 * @param {String} email 
 */
// function checkEmailUnique(email) {
// 	var unique = true;
// 	connection.query("SELECT * FROM accounts WHERE email = ?", [email], (error, results, fields) => {
// 		if(results.length > 0) unique = false;
// 	});
// 	return unique;
// }

/**
 * Check if password and password repeat satisfy requirements.
 * @param {String} password
 * @param {String} passwordRepeat
 */
function checkPassword(password, passwordRepeat) {
	if (password == "" || validator.isAlpha(password)) {
		return false;
	} else if ((password.length < 8) || (password.length > 20)) {
		return false;
	} else if (password !== passwordRepeat) {
		return false;
	} else {
		return true;
	}
}

/**
 * Checks if full name is in a valid format
 */
router.post('/check-full-name', (req, res) => {
	if (checkFullName(req.body.fullName)) {
		res.sendStatus(OK);
	} else {
		res.sendStatus(BAD_REQ);
	}
});

/**
 * Checks if full name is in a valid format
 */
router.post('/check-mobile', (req, res) => {
	if (checkMobile(req.body.mobile)) {
		res.sendStatus(OK);
	} else {
		res.sendStatus(BAD_REQ);
	}
});

/**
 * Checks if email is in a valid format
 */
router.post('/check-email-format', (req, res) => {
	if (checkEmailFormat(req.body.email)) {
		res.sendStatus(OK);
	} else {
		res.sendStatus(BAD_REQ);
	}
});

/**
 * Checks if email does not already exist
 */
router.post('/check-email-unique', (req, res) => {
	console.log("in check-email-unique");
	var email = req.body.email;
	if (!email) {
		return res.sendStatus(BAD_REQ);
	}

	connection.query("SELECT * FROM accounts WHERE email = ?", [email], (error, results, fields) => {
		if (error) {
			console.log("check email unique query error", error);
			return res.sendStatus(SERVER_ERR);
		}

		if(results.length > 0) {
			console.log("check-unique-email query results", results);
			return res.sendStatus(BAD_REQ); 
		}
		res.sendStatus(OK);
	});
});

/**
 * Checks if password is valid
 */
router.post('/check-password', (req, res) => {
	if (checkPassword(req.body.password, req.body.passwordRepeat)) {
		res.sendStatus(OK);
	} else {
		res.sendStatus(BAD_REQ);
	}
});

/**
 * Creates a new account to store in the database, using full name, mobile num, email 
 * 	and password entered twice. These must be part of a json in the body of the request.  
 */
router.post('/new-account', (req, res) => {
    console.log('Excecuting new-account');
	const { fullName, mobile, email, password, passwordRepeat } = req.body;
	var validData = true;

	// check input data is valid
	if (!checkFullName(fullName)) {
		validData = false;
		console.log("bad fullname")
	} else if (!checkMobile(mobile)) {
		validData = false;
		console.log("invalid mobile")
	} else if (!checkEmailFormat(email)) {
		validData = false;
		console.log("invalid email");
	} else if (!checkPassword(password, passwordRepeat)) {
		validData = false;
		console.log("password is invalid or does not match the repeated password");
	}

	if (!validData) {
		return res.status(BAD_REQ).send("Inputs are not in the correct format").end();
	}

	// generate unique ID 
	// There is a slim chance this id is already being used, need to add a check later
	var id = Math.floor(Math.random() * 1e9); 

	// check if email is in use
	connection.query("SELECT * FROM accounts WHERE email = ?", [email], (error, results, fields) => {
		if(results.length > 0) {
			console.log(results);
			return res.status(BAD_REQ).send("Inputs are not in the correct format");  
		}

		// hashes and salts passwords (this library stores the salt in the same string as the hash)
		var hash = bcrypt.hashSync(password, 10);  // 10 is number of salt iterations
		var license = "uploads/template.png";
		var query = "INSERT INTO `accounts` (`id`, `fullName`, `hash`, `mobile`, `email`, `license`) VALUES (?,?,?,?,?,?);";
		connection.query(query, [id, fullName, hash, mobile, email, license], (error, results, field) => {
			if (error) {
				res.sendStatus(SERVER_ERR);
			} else {
				// Account was successfully created
				// creates a session for the new account
				req.session.loggedin = true;
				req.session.email = email;
				req.session.userId = id;
				res.sendStatus(OK);
			}
		})
	});	
});

/** 
 * Returns a JSON with account data (email, fullName, businessName, mobile, address)
*/
router.get('/account-data', (req, res) => {

	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	// get info from DB
	const email = req.session.email;
	const query = "SELECT * FROM accounts WHERE email = ?";
	connection.query(query, [email], (error, results, fields) => {
		if (error) {
			console.log(error);
			return res.sendStatus(SERVER_ERR);
		}
		if (results.length === 1) {
			const name = results[0].fullName;
			const email = results[0].email;
			const company = results[0].businessName;
			const mobile = results[0].mobile;
			const address =results[0].address;
			const license = results[0].license;
			const img = fs.readFileSync(license);
			const extension = license.split('.')[1];
			const imgBuffer = new Buffer(img, "binary").toString("base64");
			const jsonObj = {
				'name':name,
				'email':email,
				'address':address,
				'mobile':mobile,
				'company':company,
				'filename':license,
				'extension':extension,
				'fileData':imgBuffer
			};
			res.end(JSON.stringify(jsonObj));
		} else {
			res.sendStatus(SERVER_ERR);  //database error
		}
	})
});

/**
 * An endpoint for testing if a session is active
 */
router.get('/dummy-data', (req, res) => {
	if (req.session.loggedin) {
		res.send("This is a secret message for " + req.session.email);
	} else {
		res.send("You must log in to view this data")
	}
	res.end();
});

router.get('/map-data-detailed-old', (req, res) => {
	if (req.session.loggedin) {
		axios.get("https://wt9amkgopl.execute-api.ap-southeast-2.amazonaws.com/prd/api/website/available-parks").then(response => {
			var carParks = convertMapData(response.data);
			return res.send(carParks);
		})
		
	} else {
		return res.sendStatus(UNAUTH);
	}
});

/**
 * Adds a customer to the paydock sandbox
 * Example body of a request:
 * {
    "addressLine1": "1 Queen Street",
    "city": "Brisbane",
    "state": "QLD",
    "postcode": "4000",
    "cardName": "MR TEST SMITH",
    "cardNum": "4200000000000000",
    "cardCCV": "123",
    "expireYear": "21",
	"expireMonth": "12"
	}
 */
router.post('/add-payment-info', async (req, res) => {
	/* NOTE: Only card numbers 4200000000000000 and 5520000000000000 can be used for testing,
		with ccv being 123. Expiry must be any future data */
	
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}
	
	var fields = ["cardName", "cardNum", "cardCCV", "expireYear", "expireMonth"];

	for (i = 0; i < fields.length; i++) {
		if (!req.body[fields[i]]) {
			return res.status(BAD_REQ).send(`Must Provide ${fields}`);
		}
	}

	query = "SELECT `fullName`, `mobile`, `paymentId` FROM accounts WHERE id = ?"
	connection.query(query, [req.session.userId], (queryErr, queryRes, queryFields) => {
		if (queryErr) {
			return res.sendStatus(SERVER_ERR);
		}

		var mobile = queryRes[0].mobile;
		var fullName = queryRes[0].fullName;
		var paymentId = queryRes[0].paymentId;
		if (paymentId) {
			// payment details are already stored
			return res.status(BAD_REQ).send("User already stored their details, delete first before updating");
		}

		if (mobile.slice(0,3) !== "+61") {  // paydock thing will return bad request if number is not international
			if (mobile[0] === "0") {
				mobile = mobile.slice(1,mobile.length);
			}
			mobile = "+61" + mobile;
		}
		console.log("add payment endpoint");
		//console.log("mobile:", mobile);
		//console.log("fullname:", fullName);

		var firstName;
		var lastName;
		var nameSplit = fullName.split(" ");

		// Maybe we should be storing first name and surname in our database???
		if (nameSplit.length === 2) {
			firstName = nameSplit[0];
			lastName = nameSplit[1];

		} else if (nameSplit.length >= 3) {
			firstName = nameSplit[0];
			lastName = nameSplit.slice(1, nameSplit.length).join(" ");
		
		} else {
			firstName = "";
			lastName = fullName;
		}

		var url = "https://api-sandbox.paydock.com/v1/customers";

		var paymentSource = {
			// "address_line1": req.body.addressLine1,
			// "address_line2": "",
			// "address_city": req.body.city,
			// "address_state": req.body.state,
			"address_country": "AU",
			//"address_postcode": req.body.postcode,
			"gateway_id": "590c195c74bff71530825b69", 
			"card_name": req.body.cardName,
			"card_number": req.body.cardNum,
			"expire_month": req.body.expireMonth,
			"expire_year": req.body.expireYear,
			"card_ccv": req.body.cardCCV
		};

		// got information needed, now send to paydock
		axios({
			method: "post",
			url: url,
			headers: {
				'content-type' : 'application/json',
				'x-user-secret-key': 'a5196e82798c0d45f8ba5def0725a332c4c60242'
			},
			data: {
				"reference": "reference",
				"first_name": firstName,
				"last_name": lastName,
				"email": req.session.email,
				"phone": mobile,
				"payment_source": paymentSource
			}
	
		}).then(function (response) {
			console.log(response.status);
			console.log(response.data.resource.data);
			
			// store paydock customer id
			var idToSave = response.data.resource.data._id; 
			var query2 = "UPDATE `accounts` SET `paymentId` = ? WHERE `id` = ?";
			connection.query(query2, [idToSave, req.session.userId], (err, result, fields) => {
				if (err) {
					console.log("Saving paymentId query error:", err);
					return res.sendStatus(SERVER_ERR);
				}
				return res.sendStatus(response.status);
			})
			

		}).catch(function (error) {
			console.log(error);
			res.status(SERVER_ERR).send(error);
		})
	})
});

router.get("/get-payment-info", (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var query = "SELECT `paymentId` FROM `accounts` WHERE `id` = ?";
	connection.query(query, [req.session.userId], (error, results,  fields) => {
		if (error) {
			console.log("getting paymentId query error:", err);
			return res.sendStatus(SERVER_ERR);
		}

		var paymentId = results[0].paymentId;
		if (!paymentId) {
			// this user has not stored their payment details
			console.log("User does not have payment details stored")
			return res.send("User does not have payment details"); 
		} 

		// getting the payment details from paydock
		axios({
			method: "get",
			url: "https://api-sandbox.paydock.com/v1/customers/" + paymentId,
			headers: {
				'content-type' : 'application/json',
				'x-user-secret-key': 'a5196e82798c0d45f8ba5def0725a332c4c60242'
			}

		}).then(function (response) {
			console.log(response.status);

			var paymentInfo = response.data.resource.data.payment_sources[0];
			console.log(paymentInfo);
			
			res.send(paymentInfo);
	
		}).catch(function (error) {
			console.log(error);
			res.status(SERVER_ERR).send(error);
		})
	})
})

router.delete("/remove-payment-info", (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var query = "SELECT `paymentId` FROM `accounts` WHERE `id` = ?";
	connection.query(query, [req.session.userId], (error, results,  fields) => {
		if (error) {
			console.log("getting paymentId query error:", err);
			return res.sendStatus(SERVER_ERR);
		}

		var paymentId = results[0].paymentId;
		if (!paymentId) {
			// this user has not stored their payment details
			console.log("User does not have payment details stored, cannot delete")
			return res.status(BAD_REQ).send("User does not have payment details"); 
		} 

		// delete customer paydock request
		axios({
			method: "delete",
			url: "https://api-sandbox.paydock.com/v1/customers/" + paymentId,
			headers: {
				'content-type' : 'application/json',
				'x-user-secret-key': 'a5196e82798c0d45f8ba5def0725a332c4c60242'
			}
		}).then(function (response) {
			console.log(response.status);

			var paymentInfo = response.data.resource.data.payment_sources[0];
			var vaultToken = paymentInfo.vault_token;

			// customer is deleted, now delete vault token for credit card
			axios({
				method: "delete",
				url: "https://api-sandbox.paydock.com/v1/vault-tokens/" + vaultToken,
				headers: {
					'content-type' : 'application/json',
					'x-user-secret-key': 'a5196e82798c0d45f8ba5def0725a332c4c60242'
				}
			}).then(function (response2) {

				// set payment Id in our database to null
				var query2 = "UPDATE `accounts` SET `paymentId` = ? WHERE `id` = ?";
				connection.query(query2, [null, req.session.userId], (error2, results2, fields2) => {
					if (error2) {
						console.log(error2);
						return res.sendStatus(SERVER_ERR);
					}

					console.log(`deleted payment details for user ${req.session.userId}`);
					res.sendStatus(response.status);
				})

			}).catch(function (error2) {
				console.log("Deleted customer but could not delete vault token")
				console.log(error2);
				res.status(SERVER_ERR).send(error2);
			})

		}).catch(function (error) {
			console.log(error);
			res.status(SERVER_ERR).send(error);
		})
	})
})

/**
 * Converts the carpark data retrieved from Amazon Lambda into a format readable by the detailed map
 * @param {*} data - Object containing unformatted parking data
 */
function convertMapData(data) {
	// Initialise array to store each parking spot
	var carParks = [];
	// Create a Park object for each carpark, populate with data
	for (var i = 0; i < data.length; i++) {
		var park = data[i];
		var currentPark = {
			"id" : "0",
			"address" : park.displayname,
			"region" : "Brisbane", // Hardcode for the moment until we receive google auth
			"geo" : {
				"latitude" : park.geoloaction[0],
				"longitude" : park.geoloaction[1]
			},
			"type" : park.listingtype,
			"suitablefor" : park.suitablefor,
			"accesshours" : park.accesshours,
			"wheelchairfriendly" : park.wheelchairfriendly
		};
		carParks.push(currentPark);
	}
	return carParks;
}

/**
 * Returns a minimal set of parking data from the database in JSON form
 */
router.get('/map-data-minimal', (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var query = 'SELECT DISTINCT `suburb` FROM park';
	connection.query(query, [], (error, results, field) => {
		if (error) {
			console.log(error);
			res.sendStatus(SERVER_ERR);
			return;
		} else {
			return res.send(results);
		}
	})
});

/**
 * Returns a detailed set of data from the database in JSON form.
 * Also counts number of available parks at each location.
 */
router.get('/map-data-detailed', (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var query = 'SELECT `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, `longitude`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, `wheelchairAccess`, `additionalComments`, COUNT(*) - COUNT(`parkId`) AS availableParks FROM `park` p LEFT JOIN `parks_in` i ON p.id = i.parkId GROUP BY `street`, `suburb`, `region`, `state`, `postcode`, `latitude`, `longitude`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, `wheelchairAccess`, `additionalComments`';
	connection.query(query, [], (error, results, field) => {
		if (error) {
			console.log(error);
			res.send(SERVER_ERR);
			return;
		} else {
			console.log("\n map data query results:", results);
			resultsToSend = [];
			for (i = 0; i < results.length; i++) {
				if (results[i].availableParks >= 1) {
					resultsToSend.push(results[i]);
				}
			}
			return res.send(resultsToSend);
		}
	})
});

router.post('/park-info', (req, res) => {
	// Ensure user is logged in
	if (!req.session.loggedin) {  
		return res.sendStatus(UNAUTH);
	}

	var parkId = req.body.parkId;
	if (!parkId) {  // Park id must be set 
		return res.status(BAD_REQ).send("parkId was not provided");
	}

	var query = "SELECT * FROM `park` WHERE `id` = ?";
	connection.query(query, [parkId], (error, results, field) => {
		if (error) {
			console.log(error);
			return res.status(SERVER_ERR).send(error);
		}
		if (results.length === 1) {
			res.send(results[0]);
		} else {
			console.log(`parkId ${parkId} does not exist`);
			res.status(BAD_REQ).send(`parkId ${parkId} does not exist`);
		}
	})

});

router.get('/my-parks', (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var query = 'SELECT `id`, `street`, `suburb`, `state`, `postcode`, `latitude`, `longitude`, `bayNumber`, `price`, `type`, `suitableFor`, `accessHours`, `carparkType`, `wheelchairAccess`, `additionalComments` AS availableParks FROM `park` p LEFT JOIN `parks_in` i ON p.id = i.parkId WHERE i.userId = ?';
	connection.query(query, [req.session.userId], (error, results, field) => {
		if (error) {
			console.log(error);
			res.sendStatus(SERVER_ERR);
			return;
		} else {
			console.log("\n my parks query results:", results);
			return res.send(results);
		}
	})
});

router.post('/get-available-park', (req, res) => {
	const { suburb, street, postcode, type } = req.body;
	console.log("get-available-park input:", req.body)

	// Ensure user is logged in
	if (!req.session.loggedin) {  
		return res.sendStatus(UNAUTH);
	}

	// Ensure all data is available
	if (!(suburb && street && postcode && type)) {
		return res.status(BAD_REQ).send("suburb, street, postcode or type missing");
	}

	checkQuery = "SELECT MIN(`id`) AS minimum FROM `park` p LEFT JOIN `parks_in` i ON p.id = i.parkId WHERE `suburb` = ? AND `street` = ? AND `postcode` = ? AND `type` = ? AND `parkId` IS NULL";
	connection.query(checkQuery, [suburb, street, postcode, type], (err, result) => {
		if (err) {
			console.log(err);
			return res.sendStatus(SERVER_ERR);
		}
	
		var smallestAvailablePark = result[0].minimum;
		console.log(smallestAvailablePark)

		// Result is the smallest id of available parks in requested location, null if none exist
		if (smallestAvailablePark === null) {	// No free parks in this location
			console.log(`No parks at ${suburb} ${street} ${postcode} ${type} are available`);
			return res.send("No Parks available");
		}
		console.log(`Park with id ${smallestAvailablePark} at ${suburb} ${street} ${postcode} ${type} is available!`);
		return res.send({"parkId": smallestAvailablePark});
	})
});

/**
 * Books a park in the database. Will conduct a final check to see if parks are available first. Must be logged in.
 */
router.post('/book-park', (req, res) => {
	var parkId = req.body.parkId;
	console.log("IN book-park");
	console.log("parkId:", parkId);

	// Ensure user is logged in
	if (!req.session.loggedin) {  
		return res.sendStatus(UNAUTH);
	}

	if (!parkId) {  // Park id must be set 
		return res.status(BAD_REQ).send("parkId was not provided");
	}

	parkId = parseInt(parkId);
	if (isNaN(parkId)) {
		return res.status(BAD_REQ).send("parkId was not an integer");
	}
	
	//TODO: Check payment details are valid

	// check if id is available
	var checkQuery = "SELECT * FROM parks_in WHERE parkId = ?";
	connection.query(checkQuery, [parkId], (checkErr, checkRes) => {
		if (checkErr) {
			console.log(checkErr);
			return res.sendStatus(SERVER_ERR);
			
		} else if (checkRes.length >= 1) {
			// this park is already booked 
			return res.status(BAD_REQ).send("This park is already booked");
		}

		// Update databse to include booking
		var bookQuery = "INSERT INTO `parks_in` (`parkId`, `userId`) VALUES (?, ?)"
		connection.query(bookQuery, [parkId, req.session.userId], (bookErr, bookResult) => {
			if (bookErr) {
				console.log(bookErr);
				return res.status(SERVER_ERR).send(bookErr);
			} else {
				// Successful
				//TODO: Send PDF file to users
				try {
					sendPDF(parkId, req.session.email);
				} catch (e) {
					console.log(e);
				}
				return res.sendStatus(OK);
			}
		})
	})
});

router.post('/cancel-booking', (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var parkId = req.body.parkId;
	var userId = req.session.userId;

	if (!parkId) {
		return res.status(BAD_REQ).send("No parkId provided");
	}

	var query = "DELETE FROM `parks_in` WHERE `userId` = ? and `parkId` = ?";
	connection.query(query, [userId, parkId], (err, result) => {
		if (err) {
			console.log(err);
			return res.status(SERVER_ERR).send(err);
		}
		console.log("cancel booking query result:", result);
		
		if (result.affectedRows === 1) {
			console.log(`Deleted a booking for user ${userId} with parkId ${parkId}`);
			res.sendStatus(OK);
		} else {
			console.log(`Booking does not exist! Cannot delete booking for user ${userId} with parkId ${parkId}`);
			res.status(BAD_REQ).send("Booking does not exist, or invalid parkId");
		}
	})
})

router.post('/add-cars', async (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var id = req.session.userId;
	var brand = req.body.brand;
	var model = req.body.model;
	var plate = req.body.plate;
	var query = "insert into vehicles (plate, model, owner, brand) values(?, ?, ?, ?)";
	connection.query(query, [plate, model, id, brand], (err) => {
		if (err) {
			console.log(err);
			return res.send(err);
		} else {
			// Successful
			return res.sendStatus(200);
		}
	})
});

router.get('/get-cars', async (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var id = req.session.userId;
	var query = "select * from vehicles where owner = ?;";
	connection.query(query, [id], (err, results) => {
		if (err) {
			console.log(err);

			return res.send(err);
		} else {
			console.log(results);
			res.send(results);
		}
	})
});

router.post('/remove-cars', async (req, res) => {
	if (!req.session.loggedin) {  // checking for valid session
		return res.sendStatus(UNAUTH);
	}

	var plate = req.body.plate;
	var query = "delete from vehicles where plate = ?;";
	console.log(req.body);
	connection.query(query, [plate], (err, results) => {
		if (err) {
			console.log(err);
			return res.send(err);
		} else {
			return res.sendStatus(200);
		}
	})
});

/**
 * Returns the number of sign-ups received this week
 */
router.get('/statistics-week', (req, res) => {
	var query = 'SELECT DATE(`created`) as createdDate, COUNT(*) as number FROM `accounts` GROUP BY DATE(`created`) HAVING createdDate > DATE_SUB(CURDATE(), INTERVAL 1 week)';
	connection.query(query, [], (error, results, field) => {
		if (error) {
			console.log(error);
			res.sendStatus(SERVER_ERR);
			return;
		} else {
			return res.send(results);
		}
	})
});

/**
 * Returns the number of sign-ups received for each month this year
 */
router.get('/statistics-month', (req, res) => {
	var query = 'SELECT MONTH(`created`) as createdDate, COUNT(*) as number FROM `accounts` WHERE `created` > DATE_SUB(CURDATE(), INTERVAL 1 year) GROUP BY MONTH(`created`)';
	connection.query(query, [], (error, results, field) => {
		if (error) {
			console.log(error);
			res.sendStatus(SERVER_ERR);
			return;
		} else {
			return res.send(results);
		}
	})
});

/**
 * Returns the number of sign-ups received in total
 */
router.get('/statistics-total', (req, res) => {
	var query = 'SELECT COUNT(*) as number FROM `accounts`';
	connection.query(query, [], (error, results, field) => {
		if (error) {
			console.log(error);
			res.sendStatus(SERVER_ERR);
			return;
		} else {
			return res.send(results);
		}
	})
});

module.exports = router;
