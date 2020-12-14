/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
    var express = require('express');
    var router = express.Router();
 
    function getLocation(res, mysql, context, complete){
        mysql.pool.query("SELECT LOCATION_ID, ZIP_CODE, CITY, STATE from LOCATION ORDER BY LOCATION_ID", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.location = results;
            complete();
        });
    }

    /*Display all LOCATIONS. Requires web based javascript to delete users with AJAX*/
    router.get('/', function(req, res){ /* mounted to people*/
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
		context.jsscripts = ["locationDelete.js"];
        getLocation(res, mysql, context, complete);
        function complete(){ 
            callbackCount++;
            if(callbackCount >= 1){ // 1 async function, getLocation, if more change
                res.render('location', context);
            }
        }
    });   
	
	
	//----------------------------------------INSERT for LOCATION with POST, refreshes after posting 
	router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
		var callbackCount = 0;
		
		//https://stackoverflow.com/questions/47447935/insert-into-many-to-many-table-node-js-mysql
		//https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js		

		//------------- INSERT into people
		var sql_1 = "INSERT INTO LOCATION (ZIP_CODE, CITY, STATE) VALUES (?, UPPER(?), UPPER(?))";
        var inserts_1 = [req.body.nm_location_zipCodeAdd, req.body.nm_location_cityAdd ,req.body.nm_location_stateAdd];			
		mysql.pool.query(sql_1,inserts_1,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
			} else {
				complete(); //need this in order to asynch to WAIT in function below
			}
		});
	
		function complete(){ 
            callbackCount++;
            if(callbackCount >= (1)){ // note count
                res.redirect('/location');
            }
        }				
			
	});	

	//----------------------------------------DELETE for location
	// note there is a locationDelete.js file needed for delete to work, referenced above in router.get
	
    router.delete('/:location_id', function(req, res){	
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM LOCATION WHERE LOCATION_ID = ?";
        var inserts = [req.params.location_id];
	
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    });
	
	

    return router;
	
}();