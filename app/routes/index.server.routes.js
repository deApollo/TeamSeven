var multer = require('multer');
var fs = require('fs');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './../public/images/userimages')
  },
  filename: function (req, file, cb) {
    if(req.body.username) {
        cb(null, req.body.username + '.jpg');
    } else {
        cb(null,req.session.username + '.jpg');
    }
  }
});

function deleteOldPicture(req,res,next){
    fs.stat('foo.txt', function(err, stat) {
        if(err == null)
            fs.unlinkSync('./../public/images/userimages/' + req.session.username + '.jpg');
        next();
    });
}
var upload = multer({ storage: storage });

module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    var preferences = require('../controllers/preferences.server.controller');
    var register = require('../controllers/register.server.controller');
    var dashboard = require('../controllers/dashboard.server.controller');
    var workouts = require('../controllers/workouts.server.controller');
    var changepassword = require('../controllers/changepassword.server.controller');
    var login = require('../controllers/login.server.controller');
    var data = require("../controllers/data.server.controller");

    app.get('/', index.render);
    app.get('/logout', login.validate, login.logout);
    app.get('/register', register.render);
    app.get('/dashboard', login.validate, dashboard.render);
    app.get('/preferences', login.validate, preferences.render);
    app.get('/changepassword', login.validate, changepassword.render);
    app.get('/workouts', login.validate, workouts.render);
    app.get('/data/getExercises',login.validate, data.getExercises);
    app.get('/data/getWorkouts',login.validate, data.getWorkouts);

    app.post('/login', login.login);
    app.post('/logout', login.validate, login.logout);
    app.post('/register', upload.single('avatar') ,login.register);
    app.post('/data/addWorkout', login.validate, data.addWorkout);
    app.post('/data/removeWorkout', login.validate, data.removeWorkout);
    app.post('/data/addExercise', login.validate, data.addExercise);
    app.post('/data/removeExercise', login.validate, data.removeExercise);
    app.post('/data/changeUserPreference', login.validate, data.changeUserPreference);
    app.post('/data/changeUserPicture', login.validate, deleteOldPicture, upload.single('avatar'), data.changeUserPicture);
};
