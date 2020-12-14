/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
	
    var express = require('express');
    var router = express.Router();
	
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
	
	//----------------------------------------SELECT for SPECIES
    function getSpeciesNames(res, mysql, context, complete){
        mysql.pool.query("SELECT SPECIES_NAME FROM SPECIES ORDER BY SPECIES_ID",
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.species_names = results;
            complete();
        });
    }
	

	
		//----------------------------------------SELECT for ALL PEOPLE
    function getAllPeople(req, res, mysql, context, complete){		

		var sql = "select  PEOPLE.FIRST_NAME, PEOPLE.LAST_NAME, SPECIES.SPECIES_NAME, LOCATION.ZIP_CODE FROM PEOPLE INNER JOIN PEOPLE_LOCATION ON PEOPLE_LOCATION.PEOPLE_ID = PEOPLE.PEOPLE_ID INNER JOIN LOCATION ON PEOPLE_LOCATION.LOCATION_ID = LOCATION.LOCATION_ID INNER JOIN PEOPLE_SPECIES ON PEOPLE_SPECIES.PEOPLE_ID = PEOPLE.PEOPLE_ID INNER JOIN SPECIES ON SPECIES.SPECIES_ID = PEOPLE_SPECIES.SPECIES_ID";

		mysql.pool.query(sql,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
			} else {				
				context.people = results;
				complete(); //need this in order to asynch to WAIT in function below
			}
		});
		
	};
	
	
	//----------------------------------------SELECT for ALL ANIMALS
    function getAllAnimals(req, res, mysql, context, complete){		

		var sql = "select  ANIMAL.NAME, ANIMAL.AGE, ANIMAL.WEIGHT, SPECIES.SPECIES_NAME, LOCATION.ZIP_CODE FROM ANIMAL INNER JOIN LOCATION ON ANIMAL.LOCATION_ID = LOCATION.LOCATION_ID  INNER JOIN SPECIES ON ANIMAL.SPECIES_ID = SPECIES.SPECIES_ID";	
		mysql.pool.query(sql,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
			} else {				
				context.animals = results;
				complete(); //need this in order to asynch to WAIT in function below
			}
		});
		
	};
	
	
	//----------------------------------------SELECT for PEOPLE
    function getPeople(req, res, mysql, context, complete){		

		var sql = "select  PEOPLE.FIRST_NAME, PEOPLE.LAST_NAME, SPECIES.SPECIES_NAME, LOCATION.ZIP_CODE FROM PEOPLE INNER JOIN PEOPLE_LOCATION ON PEOPLE_LOCATION.PEOPLE_ID = PEOPLE.PEOPLE_ID INNER JOIN LOCATION ON PEOPLE_LOCATION.LOCATION_ID = LOCATION.LOCATION_ID INNER JOIN PEOPLE_SPECIES ON PEOPLE_SPECIES.PEOPLE_ID = PEOPLE.PEOPLE_ID INNER JOIN SPECIES ON SPECIES.SPECIES_ID = PEOPLE_SPECIES.SPECIES_ID WHERE SPECIES.SPECIES_NAME = ? AND LOCATION.ZIP_CODE = ?";
        var inserts = [req.query.nm_matchSpecies, req.query.nm_matchZipCode];			
		mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
			} else {				
				context.people = results;
				complete(); //need this in order to asynch to WAIT in function below
			}
		});
		
	};
	
	//----------------------------------------SELECT for ANIMALS
    function getAnimals(req, res, mysql, context, complete){		

		var sql = "select  ANIMAL.NAME, ANIMAL.AGE, ANIMAL.WEIGHT, SPECIES.SPECIES_NAME, LOCATION.ZIP_CODE FROM ANIMAL INNER JOIN LOCATION ON ANIMAL.LOCATION_ID = LOCATION.LOCATION_ID  INNER JOIN SPECIES ON ANIMAL.SPECIES_ID = SPECIES.SPECIES_ID WHERE SPECIES.SPECIES_NAME = ? AND LOCATION.ZIP_CODE = ?";
		var inserts = [req.query.nm_matchSpecies, req.query.nm_matchZipCode];	
		mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
			} else {				
				context.animals = results;
				complete(); //need this in order to asynch to WAIT in function below
			}
		});
		
	};
		

	
	//----------------------------------------Display SELECT results
    router.get('/', function(req, res){ 
	
		var countGets = 0;
	
        var callbackCount = 0;
        var context = {};		
        var mysql = req.app.get('mysql');
		
		context.jsscripts = ["filterMatchTables.js"];
	
		if (typeof(req.query.nm_matchZipCode) != 'undefined' && !typeof(req.query.nm_matchSpecies) != 'undefined' ){
			getAllPeople(req, res, mysql, context, complete);
			getAnimals(req, res, mysql, context, complete);	
			
			getZipCodes(res, mysql, context, complete);
			getSpeciesNames(res, mysql, context, complete);
			
			countGets = 4;
		} else {
			getAllPeople(req, res, mysql, context, complete);
			getAllAnimals(req, res, mysql, context, complete);
			getZipCodes(res, mysql, context, complete);
			getSpeciesNames(res, mysql, context, complete);
			countGets = 4;
		}		
        	

		
        function complete(){ 
            callbackCount++;
            if(callbackCount >= countGets){ 
                res.render('match', context);
            }
        }
    });   


	


		

    return router;	
}();