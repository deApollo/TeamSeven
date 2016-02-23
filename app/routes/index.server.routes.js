module.exports = function(app) {
    var index = require('../controllers/index.server.controller');
    var login = require('../controllers/login.server.controller');

    app.get('/', index.render);

    app.post('/login', login.login, index.render);
    app.post('/logout', login.logout, index.render);
    app.post('/register', login.register, index.render);
};
