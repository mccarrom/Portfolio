/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

module.exports = function(){
    var express = require('express');
    var router = express.Router();
 
    function getPeople_Species(res, mysql, context, complete){
        mysql.pool.query("SELECT PEOPLE_SPECIES.PEOPLE_SPECIES_ID , PEOPLE.PEOPLE_ID, PEOPLE.FIRST_NAME , PEOPLE.LAST_NAME, SPECIES.SPECIES_ID, SPECIES.SPECIES_NAME FROM PEOPLE_SPECIES INNER JOIN PEOPLE ON PEOPLE.PEOPLE_ID=PEOPLE_SPECIES.PEOPLE_ID INNER JOIN SPECIES ON SPECIES.SPECIES_ID = PEOPLE_SPECIES.SPECIES_ID ORDER BY PEOPLE.LAST_NAME, PEOPLE.FIRST_NAME, SPECIES.SPECIES_NAME", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people_species = results;
            complete();
        });
    }
	
	//----------------------------------------SELECT for SPECIES NAMES
    function getSpeciesNames(res, mysql, context, complete){
        mysql.pool.query("SELECT SPECIES_NAME FROM SPECIES ORDER BY SPECIES_NAME", 
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.species_names = results;
            complete();
        });
    }

	//----------------------------------------SELECT for People Names
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

	//----------------------------------------INSERT for PEOPLE SPECIES with POST, refreshes after posting 
	router.post('/', function(req, res){
		
		var context = {};
        var mysql = req.app.get('mysql');				
		var callbackCount = 0;	
		
		//------------- INSERT into PEOPLE_SPECIES
		var specs = req.body.nm_peopleSpeciesNameAdd;
		var countSpecs = 0;	
		
		var name = req.body.nm_peopleSpecNameAdd.split(", ");
		

		if (typeof specs === "string") {
			countSpecs = 1;
		} else {
			for (let spec of specs) {// need to set up counter BEFORE LOOPING, so the function complete() below will wait for all of the inserts
				countSpecs = countSpecs +1;  
			}
		}
		
		if (typeof specs === "string") {
			mysql.pool.query("INSERT INTO `PEOPLE_SPECIES` (`PEOPLE_ID`, `SPECIES_ID`) VALUES ((SELECT DISTINCT PEOPLE_ID FROM PEOPLE WHERE FIRST_NAME = ? and LAST_NAME = ?), (SELECT DISTINCT SPECIES_ID FROM SPECIES WHERE SPECIES_NAME in (?) ))", [name[1],name[0], req.body.nm_peopleSpeciesNameAdd],
				function(error, results, fields){
					if(error){
						res.write(JSON.stringify(error));
						res.end();
					}
					complete(); //need this in order to asynch to WAIT in function below
			});
					
		} else {
			for (let spec of specs) {
			
			mysql.pool.query("INSERT INTO `PEOPLE_SPECIES` (`PEOPLE_ID`, `SPECIES_ID`) VALUES ((SELECT DISTINCT PEOPLE_ID FROM PEOPLE WHERE FIRST_NAME = ? and LAST_NAME = ?), (SELECT DISTINCT SPECIES_ID FROM SPECIES WHERE SPECIES_NAME in (?) ))", [name[1],name[0],spec],
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
            if(callbackCount >= (countSpecs )){ // note count
                res.redirect('/people_species');
            }
        }	
		
	});



    /*Display all people. Requires web based javascript to delete users with AJAX*/
    router.get('/', function(req, res){ /* mounted to people*/
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
		context.jsscripts = ["peopleSpeciesDelete.js"]; // for deleting below
        getPeople_Species(res, mysql, context, complete);
		getSpeciesNames(res, mysql, context, complete);
		getPeopleNames(res, mysql, context, complete);
        function complete(){ 
            callbackCount++;
            if(callbackCount >= 3){ // 3 async functions, always increase # by 1 per get function
                res.render('people_species', context);
            }
        }
    });   

		//----------------------------------------DELETE for PEOPLE_SPECIES
	// note there is a peopleSpeciesDelete.js file needed for delete to work, referenced above in router.get
	
    router.delete('/:people_id&:species_id', function(req, res){
	
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM PEOPLE_SPECIES WHERE PEOPLE_ID = ?  AND SPECIES_ID = ?";		
		
        var inserts = [req.params.people_id, req.params.species_id];
	
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