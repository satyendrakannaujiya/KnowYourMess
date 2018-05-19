var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const sha = require('sha256');
const users = require('./models/users.js'); 
const hostels=require('./models/hostels.js');
const mess_bills=require('./models/mess_bills.js');
const utility = require('./utility/utility.js');
const mess_menu = require('./models/mess_menu.js');
const fs = require('fs');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy({
    usernameField:'uid',
    passwordField:'password'
  },
  function(uid, password, cb) {
    password=sha(password);
    users.getUserById(uid, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));


const loginFailure="/login?error=1";
const loginRequired="/login";
// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.uid);
});

passport.deserializeUser(function(uid, cb) {
  users.getUserById(uid,(err,user)=>
  {
    if(err||user===undefined){
      return cb("There was some error");
    }
    cb(undefined,user);
  });
});

function setUpRoutes(app){
  
  //Adding middleware to parse read post attributes and session
  app.use(require('body-parser').urlencoded({ extended: true }));
  app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/create_user',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  function(req, res){
    if(req.user.is_admin==0){
      res.send("You are not the admin, you cannot create another user");
      return;
    }

    var userDetails={
      uid:req.body.uid,
      password:sha(req.body.password),
      is_admin:req.body.is_admin===undefined?0:1,
      hostel_id:req.body.hostel_id,
      name:req.body.name,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      contact: req.body.contact
    }
    users.createUser(userDetails,(err,created)=>
    {
      if(!err&&created==true)
      {
        res.redirect('/Manage');
      }else
      {
       console.log(err);
        res.send("The user insertion failed!");
      }
    });
  });

  app.get('/create_user',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  function(req, res){
    if(req.user.is_admin==0){
      res.send('You are not the admin!.');
      return;
    }
    hostels.getHostelsList((err,hostels)=>
    {
      res.render('createUser.hbs',{hostels});
    })
  });

  app.get('/create_hostel',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  function(req, res){
    if(req.user.is_admin==0){
      res.send("You are not the admin!.");
      return;
    }
    hostels.getHostelsList((err,hostels)=>
    {
      res.render('createHostel.hbs');
    })
  });

  app.post('/create_hostel',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  function(req, res){
    if(req.user.is_admin==0){
      res.send("You are not the admin!.");
      return;
    }
    var hostelDetails={
      name:req.body.name,
      description:req.body.description
    };
    var image = req.files.image;
    hostels.createHostel(hostelDetails,(err,isSuccess)=>
    {
      if(!err&&isSuccess==true)
      {
        hostels.getHostelsList((error, result) => {
          var hid = result[result.length -1].hid;
      if(!fs.existsSync(__dirname +'/public/images/hostels'))
      {
        fs.mkdirSync(__dirname +'/public/images/hostels');
      }
      fs.unlink(__dirname +'/public/images/hostels/'+hid+'.jpg',(err)=>
        {
          image.mv(__dirname +'/public/images/hostels/'+hid+'.jpg',(err)=>
          {
            if(err)
            {
              console.log(err);
              return res.send("Error");
            }
          });
        });
        
          mess_menu.createMessMenu(hid, (error, result) => {
            res.redirect('/Manage');
          })
        });
      }else
      {
        console.log(err);
        res.send("Error occured");
      }
    });
  });


  app.get('/login',
  function(req, res){
    res.render('LoginPage.hbs',{
      error:req.query.error
    });
  });

  //Takes in uid and password as post paramenters to login
  app.post('/login', 
  passport.authenticate('local',{ failureRedirect: loginFailure }),
  function(req, res) {
    res.redirect("/");
  });

  app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get('/EditProfile',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req, res) => {
    var error=req.query.pass_status==1?1:0;
    res.render('EditProfile', {user: req.user,error});
  });

  app.get('/EditHostel',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req, res) => {
    var hid=req.query.hid;
    if(hid === undefined)
      console.log('Hid is undefined in /EditHostel request');
    hostels.getHostelById(hid,(err,hostelDetails)=>
    {
      res.render('EditHostel', {user: req.user,hostelDetails});
    });
    
  });

  app.post('/EditHostel',
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req, res) => {
    var name=req.body.name;
    var description=req.body.description;
    var image=req.files.image;
    var hid=req.body.hid;
    var hostelDetails={
      hid,
      name,
      description,
    };
    hostels.editHostel(hostelDetails,(err,reply)=>{
      if(err)
        return console.log(err);
      if(image)
      {
        require('fs').unlink(__dirname +'/public/images/hostels/'+hid+'.jpg',(err)=>
        {
          image.mv(__dirname +'/public/images/hostels/'+hid+'.jpg',(err)=>
          {
            if(err)
            {
              console.log(err);
              return res.send("Error");
            }else{
              return res.redirect("/");
            }
          });
        });
      }else
      {
        return res.redirect("/");
      }
    });
  });
  app.get("/UploadBill",
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req,res)=>
  {
    var hid=req.user.hostel_id;
    hostels.getHostelById(hid,(err,hostelDetails)=>
    {
      res.render("UploadBill.hbs",{user:req.user,hostelDetails});
    });
  });

  app.post("/UploadBill",
  require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req,res)=>
  {
    var hid=req.user.hostel_id;
    var mess_bill=req.files.mess_bill;
    var price=req.body.price;
    var uid=req.user.uid;
    var date=req.body.date;
    var file=hid+uid+date;
    var finalBill={
      hid,
      mess_bill,
      price,
      uid,
      date,
      file
    };
    if(!fs.existsSync(__dirname+'/public/bills/'))
    {
      fs.mkdirSync(__dirname+'/public/bills/');
    }
    mess_bill.mv(__dirname+'/public/bills/'+file+'.pdf',(err)=>
    {
      mess_bills.createMessBill(finalBill,(err)=>
      {
        console.log(err);
        res.redirect("/");
      });
    });
  });
  app.get('/Manage', require('connect-ensure-login').ensureLoggedIn(loginRequired),
  (req, res) => {
    if(req.user.is_admin) {
      users.getAllUsers((error, result) => {
        if(error) {
          console.log(error);
          return;
        }
        hostels.getHostelsList((error, hostelList) => {
        var hostelNames = [];
        for(var i = 0; i < hostelList.length; i++)
          hostelNames.push({name: hostelList[i].name, hid: hostelList[i].hid});

        var userList = [];
        for(var i = 0; i < result.length; i++)
          if(!result[i].is_admin)
            hostelNames.forEach((x) => {
                if(x.hid == result[i].hostel_id) {
                  userList.push({
                    uid: result[i].uid,
                    name: result[i].name,
                    hostel: x.name,
                    hid: result[i].hostel_id,
                    contact: result[i].contact
                 });
              }
            });
            res.render('AdminMenu', {user: req.user,
                                      userList,
                                      hostelList});
        });
      });
      return;
    }
    hostels.getHostelById(req.user.hostel_id, (err, hostelDetails) => {
      mess_menu.getMessMenu(req.user.hostel_id, (error, result) => {
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
          res.render('HostelMenu', { 
            hostel: hostelDetails,
            user:req.user,
            mess_menu
          });
          });
    }) 
  });

  app.post('/addNotification', require('connect-ensure-login').ensureLoggedIn(loginRequired),(req, res) => {
   
    utility.addNotification(req.user, req.body, (error, result) => {
      if(error)
        console.log(error);
      else
        console.log(result);
      res.redirect('/manage');
    })
  });

  app.post('/deleteNotification', require('connect-ensure-login').ensureLoggedIn(loginRequired), (req, res) => {
        utility.removeNotification(req.body.nid, (error, result) => {
      if(error) {
        res.send(error);
        console.log(error);
      }
      else
        res.redirect('/notifications?hid=' +req.user.hostel_id);
    });
  });



  app.post('/changeMenu', require('connect-ensure-login').ensureLoggedIn(loginFailure), (req, res) => {
    var temp  = utility.makeMessMenu(req.body)
    mess_menu.updateMessMenu(req.body.hid, temp, (error, result) => {
      if(error) {
        console.log(error);
        res.send(error);
      }
      else
        res.redirect(`/hostel?hid=${req.body.hid}`);
    });
  });



  app.post("/EditProfile",require('connect-ensure-login').ensureLoggedIn(loginRequired),(req,res)=>
  {
    var userDetails={
      uid:req.user.uid,
      contact:req.body.contact,
      name:req.body.name,
      facebook:req.body.facebook,
      twitter:req.body.twitter
    };
    var image=req.files.image;
    users.editUser(userDetails,(err,reply)=>{
      if(err)
        return console.log(err);
      if(image)
      {
        require('fs').unlink(__dirname +'/public/images/users/'+req.user.uid+'.jpg',(err)=>
        {
          image.mv(__dirname +'/public/images/users/'+req.user.uid+'.jpg',(err)=>
          {
            if(err)
            {
              console.log(err);
              return res.send("Error");
            }else{
              return res.redirect("/");
            }
          });
        });
      }else
      {
        return res.redirect("/");
      }
    });
  });


  app.post("/change_password",(req,res)=>
  {
    var uid=req.user.uid;
    var curpass=req.body.curpass;
    var newpass=req.body.newpass;
    curpass=sha(curpass);
    newpass=sha(newpass);
    users.getUserById(uid,(err,curuser)=>
    {
      if(curuser.password==curpass)
      {
        users.editUser({uid,password:newpass},(err)=>
        {
          if(err)
            return console.log(err);
          return res.redirect("/editProfile");
        });
      }else 
      {
        return res.redirect("/editProfile?pass_status=1");
      }
    });
  });
  app.post('/reset_password', (req, res) => {
    users.editUser({uid: req.body.uid, password: sha(req.body.password)}, (error, result)=> {
      if(error) {
          console.log(error);
          return;
      }
      res.redirect('/Manage');
    });
  });
}

module.exports={
    setUpRoutes
}