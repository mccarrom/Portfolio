/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
    var express = require('express');
    var router = express.Router();

    router.get('/', function(req, res){
        var context = {};
                res.render('admin', context);

    });


return router;

}();
