module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    var login = require('../controllers/login.server.controller');
    var upage = require("../controllers/upage.server.controller")
    var data = require("../controllers/data.server.controller")

    app.get('/', index.render);
    app.get('/upage', login.validate, upage.render)
    app.get('/data/getActivities',login.validate, data.getActivities);

    app.post('/login', login.login);
    app.post('/logout', login.validate, login.logout);
    app.post('/register', login.register);
    app.post('/data/addActivity', login.validate, data.addActivity);
    app.post('/data/removeActivity', login.validate, data.removeActivity);
};
