/* sample code from here: https://github.com/knightsamar/cs340_sample_nodejs_app  */

//THIS IS FRANNIE'S COPY 12519

module.exports = function(){
    var express = require('express');
    var router = express.Router();

	//----------------------------------------SELECT for Animal
    function getAnimal(res, mysql, context, complete){
        mysql.pool.query("SELECT a.ANIMAL_ID, CONCAT(UCASE(LEFT(a.NAME, 1)),LCASE(SUBSTRING(a.NAME, 2))) as NAME , a.AGE, a.WEIGHT, l.ZIP_CODE, CONCAT(UCASE(LEFT(s.SPECIES_NAME, 1)),LCASE(SUBSTRING(s.SPECIES_NAME, 2))) as SPECIES_NAME FROM ANIMAL a  left join SPECIES s on s.SPECIES_ID = a.SPECIES_ID left join LOCATION l on l.LOCATION_ID = a.LOCATION_ID order by a.ANIMAL_ID",
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.animal = results;
            complete();
        });
    }


//------------    ------------Selecting a single animal for update
    function getThisAnimal(res, mysql, context, id, complete){
    var sql = "SELECT ANIMAL_ID , NAME, AGE, WEIGHT, LOCATION_ID, SPECIES_ID FROM ANIMAL WHERE ANIMAL_ID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
		}
        context.animal = results[0];
        complete();
    });
	}

 
 
	//----------------------------------------SELECT for SPECIES
    function getSpeciesNames(res, mysql, context, complete){
        mysql.pool.query("SELECT SPECIES_NAME, SPECIES_ID FROM SPECIES ORDER BY SPECIES_ID",
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.species_names = results;
            complete();
        });
    }

	//----------------------------------------SELECT for ZIP CODES
    function getZipCodes(res, mysql, context, complete){
        mysql.pool.query("SELECT ZIP_CODE, LOCATION_ID FROM LOCATION ORDER BY LOCATION_ID",
		function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.zip_codes = results;
            complete();
        });
    }



    //----------------------------------------Display SELECT results
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};  
																   
        var mysql = req.app.get('mysql');
		context.jsscripts = [ "animalDelete.js"];
        getAnimal(res, mysql, context, complete);
		getSpeciesNames(res, mysql, context, complete);
		getZipCodes(res, mysql, context, complete);
  
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){ // 1 async function, getAnimal, if more change
                res.render('animal', context);
            }

        }
    });
	
	
	//----------------------------------------Display SELECT results for ONE ANIMAL for UPDATING

   router.get('/:id', function(req, res){
	   
       callbackCount = 0;   
       var context = {};
	   
       context.jsscripts = ["selected_ZipCodes_Species.js","updateAnimal.js"];
	   
       var mysql = req.app.get('mysql');
	   
       getThisAnimal(res, mysql, context, req.params.id, complete);
       getZipCodes(res, mysql, context, complete);
       getSpeciesNames(res, mysql, context, complete);
	   
       function complete(){
           callbackCount++;
           if(callbackCount >= 3){
               res.render('update_animal', context);
           }

       }
   });
   
 
				
	//----------------------------------------INSERT for Animal with POST, refreshes after posting
	router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
		
        var sql = "INSERT INTO ANIMAL (NAME, AGE, WEIGHT, LOCATION_ID, SPECIES_ID) VALUES (?,?, ?, (SELECT LOCATION_ID FROM LOCATION WHERE ZIP_CODE = ?),  (SELECT SPECIES_ID FROM SPECIES WHERE SPECIES_NAME = ?))";
        var inserts = [req.body.nm_animalNameAdd, req.body.nm_animalAgeAdd, req.body.nm_animalWeightAdd, req.body.nm_animalZipAdd,  req.body.nm_animalSpeciesAdd];
		
		if(req.body.nm_animalPostType == "ADD"){
			sql = mysql.pool.query(sql,inserts,function(error, results, fields){
				if(error){
					console.log(JSON.stringify(error))
					res.write(JSON.stringify(error));
					res.end();
				}else{
					res.redirect('/animal'); // will refresh animal page and thus get statement will be called again to refresh table		  
				}
			});
		} else {
			res.redirect('/animal'); // will refresh animal page and thus get statement will be called again to refresh table
		}	

    });



   
//  The URI that update data is sent to in order to update an animal
   router.put('/:id', function(req, res){
	   
        var mysql = req.app.get('mysql');		
        var sql = "UPDATE ANIMAL SET NAME=?, AGE=?, WEIGHT=?, LOCATION_ID = ?, SPECIES_ID =  ? WHERE ANIMAL_ID=?";
		
		locid = parseInt( req.body.nm_animalZipUpdate);
		specid = parseInt( req.body.nm_animalSpeciesUpdate);
		animalid = parseInt(req.params.id);


        var inserts = [req.body.nm_animalNameUpdate, req.body.nm_animalAgeUpdate, req.body.nm_animalWeightUpdate,locid, specid, animalid];
																																	  
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });



	//----------------------------------------DELETE for Animal
	// note there is a animalDelete.js file needed for delete to work, referenced above in router.get

    router.delete('/:animal_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM ANIMAL WHERE ANIMAL_ID = ?";
        var inserts = [req.params.animal_id];

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
