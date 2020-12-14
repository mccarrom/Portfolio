/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
    var express = require('express');
    var router = express.Router();
 
	//----------------------------------------SELECT for People
    function getPeople(res, mysql, context, complete){
        mysql.pool.query("SELECT PEOPLE_ID, FIRST_NAME, LAST_NAME FROM PEOPLE ORDER BY LAST_NAME, FIRST_NAME", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }
	

    //----------------------------------------Display SELECT results
    router.get('/', function(req, res){ /* mounted to people*/
        var callbackCount = 0;
        var context = {};		
        var mysql = req.app.get('mysql');
		context.jsscripts = ["peopleDelete.js"]; // for deleting below
        getPeople(res, mysql, context, complete);
        function complete(){ 
            callbackCount++;
            if(callbackCount >= 1){ // 1 async function, getPeople, if more change
                res.render('people', context);
            }
        }
    });   
	
	
	//----------------------------------------INSERT for PEOPLE with POST, refreshes after posting 
	router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
		var callbackCount = 0;
		
		//https://stackoverflow.com/questions/47447935/insert-into-many-to-many-table-node-js-mysql
		//https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js		

		//------------- INSERT into people
		var sql_1 = "INSERT INTO PEOPLE (FIRST_NAME, LAST_NAME) VALUES (UPPER(?), UPPER(?))";
        var inserts_1 = [req.body.nm_personFNameAdd, req.body.nm_personLNameAdd];			
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
                res.redirect('/people');
            }
        }
			
	});	
	
	//----------------------------------------DELETE for people
	// note there is a peopleDelete.js file needed for delete to work, referenced above in router.get
	
    router.delete('/:people_id', function(req, res){	
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM PEOPLE WHERE PEOPLE_ID = ?";
        var inserts = [req.params.people_id];
	
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