/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
    var express = require('express');
    var router = express.Router();
 
    function getPeople_Location(res, mysql, context, complete){
        mysql.pool.query("SELECT PEOPLE_LOCATION.PEOPLE_LOCATION_ID, PEOPLE.PEOPLE_ID, PEOPLE.FIRST_NAME , PEOPLE.LAST_NAME, LOCATION.LOCATION_ID, LOCATION.ZIP_CODE FROM PEOPLE_LOCATION INNER JOIN PEOPLE ON PEOPLE.PEOPLE_ID=PEOPLE_LOCATION.PEOPLE_ID INNER JOIN LOCATION ON LOCATION.LOCATION_ID = PEOPLE_LOCATION.LOCATION_ID ORDER BY PEOPLE.LAST_NAME, PEOPLE.FIRST_NAME, LOCATION.ZIP_CODE", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people_location = results;
            complete();
        });
    }
	
	//----------------------------------------SELECT for ZIP CODES
    function getZipCodes(res, mysql, context, complete){
        mysql.pool.query("SELECT ZIP_CODE FROM LOCATION ORDER BY LOCATION_ID", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.zip_codes = results;
            complete();
        });
    }

	//----------------------------------------SELECT for Names
    function getPeopleNames(res, mysql, context, complete){
        mysql.pool.query("SELECT CONCAT(LAST_NAME,', ',FIRST_NAME) as FULL_NAME FROM PEOPLE ORDER BY LAST_NAME, FIRST_NAME", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.full_names = results;
            complete();
        });
    }

	//----------------------------------------INSERT for PEOPLE with POST, refreshes after posting 
	router.post('/', function(req, res){
		
		var context = {};
        var mysql = req.app.get('mysql');				
		var callbackCount = 0;	
		
		//------------- INSERT into PEOPLE_LOCATION
		var locs = req.body.nm_peopleLocZipCodeAdd;
		var countLocs = 0;	
		
		var name = req.body.nm_peopleLocNameAdd.split(", ");
		

		if (typeof locs === "string") {
			countLocs = 1;
		} else {
			for (let loc of locs) {// need to set up counter BEFORE LOOPING, so the function complete() below will wait for all of the inserts
				countLocs = countLocs +1;  
			}
		}
		
		if (typeof locs === "string") {
			mysql.pool.query("INSERT INTO `PEOPLE_LOCATION` (`PEOPLE_ID`, `LOCATION_ID`) VALUES ((SELECT DISTINCT PEOPLE_ID FROM PEOPLE WHERE FIRST_NAME = ? and LAST_NAME = ?), (SELECT DISTINCT LOCATION_ID FROM LOCATION WHERE ZIP_CODE in (?) ))", [name[1],name[0], req.body.nm_peopleLocZipCodeAdd],
				function(error, results, fields){
					if(error){
						res.write(JSON.stringify(error));
						res.end();
					}
					complete(); //need this in order to asynch to WAIT in function below
			});
					
		} else {
			for (let loc of locs) {
			
			mysql.pool.query("INSERT INTO `PEOPLE_LOCATION` (`PEOPLE_ID`, `LOCATION_ID`) VALUES ((SELECT DISTINCT PEOPLE_ID FROM PEOPLE WHERE FIRST_NAME = ? and LAST_NAME = ?), (SELECT DISTINCT LOCATION_ID FROM LOCATION WHERE ZIP_CODE in (?) ))", [name[1],name[0],loc],
				function(error, results, fields){
					if(error){
						res.write(JSON.stringify(error));
						res.end();
					}
					complete(); //need this in order to asynch to WAIT in function below
			});
			}
		}		
		
		function complete(){ 
            callbackCount++;
            if(callbackCount >= (countLocs )){ // note count
                res.redirect('/people_location');
            }
        }	
		
	});



    /*Display all people. Requires web based javascript to delete users with AJAX*/
    router.get('/', function(req, res){ /* mounted to people*/
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
		context.jsscripts = ["peopleLocationDelete.js"]; // for deleting below
        getPeople_Location(res, mysql, context, complete);
		getZipCodes(res, mysql, context, complete);
		getPeopleNames(res, mysql, context, complete);
        function complete(){ 
            callbackCount++;
            if(callbackCount >= 3){ // 3 async functions, always increase # by 1 per get function
                res.render('people_location', context);
            }
        }
    });   

		//----------------------------------------DELETE for PEOPLE_LOCATION
	// note there is a peopleLocationDelete.js file needed for delete to work, referenced above in router.get
	
    router.delete('/:people_id&:location_id', function(req, res){
	
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM PEOPLE_LOCATION WHERE PEOPLE_ID = ?  AND LOCATION_ID = ?";		
		
        var inserts = [req.params.people_id, req.params.location_id];
	
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
    })
	

    return router;
	
}();