module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    var preferences = require('../controllers/preferences.server.controller');
    var changepassword = require('../controllers/index.server.controller');
    var login = require('../controllers/login.server.controller');
    var data = require("../controllers/data.server.controller");

    app.get('/', index.render);
    app.get('/preferences', login.validate, preferences.render);
    app.get('/changepassword', login.validate, changepassword.render);
    app.get('/data/getExercises',login.validate, data.getExercises);
    app.get('/data/getWorkouts',login.validate, data.getWorkouts);

    app.post('/login', login.login);
    app.post('/logout', login.validate, login.logout);
    app.post('/register', login.register);
    app.post('/data/addWorkout', login.validate, data.addWorkout);
    app.post('/data/removeWorkout', login.validate, data.removeWorkout);
    app.post('/data/addExercise', login.validate, data.addExercise);
    app.post('/data/removeExercise', login.validate, data.removeExercise);
    app.post('/data/changeUserPreference', login.validate, data.changeUserPreference);
};
