// Requires
const fs = require('fs');
const hbs = require('hbs');
const express = require('express');
const sha = require('sha256');
const validator = require('./utility/validator.js');
const users = require('./models/users.js');
const port = process.argv[2];
const bodyParser = require('body-parser');
const hostel = require('./models/hostels.js');
const htmlGenerator = require('./utility/htmlGenerator.js');
const fileUpload = require('express-fileupload');
const mess_bills=require('./models/mess_bills.js');
const utility = require('./utility/utility.js');
const mess_menu = require('./models/mess_menu.js');
// Initial setup for node
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();
app.use(express.static(__dirname +'/public/'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname +'/views/partials/');
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2 && v1!=undefined && v2!=undefined) {
    return options.fn(this);
  }
  return options.inverse(this);
});
app.use(fileUpload());
/* 
	Main Page will contain list of hostels and links for login
*/

require('./admin.js').setUpRoutes(app);

app.get('/', (request, response) => {
	//Getting hostel list from database
	hostel.getHostelsList((error, result) => {
		if(error !== undefined) 
			console.log('Error in database');
		else {
			console.log(`${result.length} Hostels found in database`);
			/* 
				Below part is a sample how to send data to html page
				Grabbing all the hostel lists from database and then converting it to a
				viewable html table using the htmlGeneraor 
				(Will be replaced with other viewable object in html)
			*/
			var hostel = [];
			result.forEach((x) =>{
				hostel.push({hostelName: x.name, hostelId: x.hid});
			});
			utility.getNotifications(0, 10, (error, topNotifications) =>{
				if(error) {
					console.log(error);
					response.send(error);
				}
				response.render('index', { 
					hostel,
					user:request.user,
					topNotifications
				});
			});
		}
	});
});


app.get("/hostel",(request,response)=>
{
	var hostelId=request.query.hid;
	var month = request.query.month;
	if(!month)
		month = new Date().getMonth();
	hostel.getHostelById(hostelId,(err,queryRep)=>
	{
		if(err){
			console.log(err);
			return;
		}
		hostel.name=queryRep.name;
		hostel.pde=queryRep.pde;
		hostel.hid=queryRep.hid;		//Temp for image display
		hostel.description=queryRep.description;
		//console.log(queryRep);
		utility.getNotifications(hostelId, 5, (error, topNotifications) =>{
				if(error) {
					console.log(error);
					response.send(error);
				}
				var hostelUsers=[];
				users.getUserByHostelId(hostelId,(error,hostelUser)=>{
					if(error){
						console.log(error);
						response.send(error);
					}
					if(!hostelUser)
						hostelUser = [];
					hostelUser.forEach((x)=>{
						hostelUsers.push({name:x.name,uid:x.uid,contact:x.contact,facebook:x.facebook,twiter:x.twitter});
					});

					
					mess_menu.getMessMenu(hostelId, (error, result) => {
					if(error)
						console.log(error);
					if(result) {
						var mess_menu = [];
						var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
						for(var i = 0; i < 7; i++) {
							var temp = {
								day: days[i],
								breakfast: result[i].breakfast,
								lunch: result[i].lunch,
								evening: result[i].evening,
								dinner: result[i].dinner
							}
							mess_menu.push(temp);
						}
					}
					mess_bills.getBillsByHidAndMonth(hostelId, month, (error, mess_bills) => {
						for (var i in mess_bills)
							mess_bills[i].date = require('dateformat')(mess_bills[i].date, "dd-mmm-yyyy");
						response.render('hostel', { 
						hostel,
						user:request.user,
						topNotifications,
						hostelUsers,
						mess_menu,
						mess_bills
					});
					});
					});
				});	
			});
	});
});

app.post('/deleteBill',(request,response)=>{
	var hid = request.body.hid;
	var file = request.body.file;
	console.log(request.body);
	mess_bills.deleteBillsByHidAndFile(hid,file,(error)=>{
		if(error)
			console.log(error);
		else
			response.redirect(`/hostel?hid=${request.body.hid}`);
	});
});

app.get('/notifications', (request, response) => {
	utility.getNotifications(request.query.hid, undefined, (error, topNotifications) =>{
		if(error) {
			console.log(error);
			response.send(error);
		}
		response.render('notifications', { 
			user:request.user,
			topNotifications
		});
	});
});
app.listen(port, () => {
	console.log(`Server is listenning on port: ${port}`);
});
