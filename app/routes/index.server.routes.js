module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    var login = require('../controllers/login.server.controller');
    var upage = require("../controllers/upage.server.controller");
    var data = require("../controllers/data.server.controller");

    app.get('/t7', index.render);
    app.get('/t7/upage', login.validate, upage.render);
    app.get('/t7/data/getActivities',login.validate, data.getActivities);

    app.post('/t7/login', login.login);
    app.post('/t7/logout', login.validate, login.logout);
    app.post('/t7/register', login.register);
    app.post('/t7/data/addActivity', login.validate, data.addActivity);
    app.post('/t7/data/removeActivity', login.validate, data.removeActivity);
};
