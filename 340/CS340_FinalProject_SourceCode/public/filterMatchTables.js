//Source: https://www.w3schools.com/howto/howto_js_filter_table.asp

function filterMatchTables() {	

  var zipcode_values = $('#id_matchZipCode').val(); 
  

  var zcElement = document.getElementById("id_matchZipCode");
  var zipcode = zcElement.options[zcElement.selectedIndex].value.toString();
  zipcode_values = [zipcode]
  
  var specElement = document.getElementById("id_matchSpecies"); 
  var species = specElement.options[specElement.selectedIndex].value;

  var peopletable = document.getElementById("matchPeopleTable_ID");
  var peoplerow =   peopletable.getElementsByTagName("tr");
  
  // Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < peoplerow.length; i++) {
		
		var currzip = peoplerow[i].getElementsByTagName("td")[3]; 
		var currspec = peoplerow[i].getElementsByTagName("td")[2]; 				

		if (currzip && currspec) {
			
		  var currziptxtValue = currzip.textContent || currzip.innerText;
		  var currspectxtValue = currspec.textContent || currspec.innerText;	

		  peoplerow[i].style.display = "none"; // hide row at first
		  for(j = 0; j < zipcode_values.length; j++){
			  
			zipcode = zipcode_values[j].toString();  
			 
			if(peoplerow[i].style.display != ""){		// if this row hasn't already been unhidden keep checking		
				if (currziptxtValue.indexOf(zipcode) > -1 && currspectxtValue.indexOf(species) > -1) {
				peoplerow[i].style.display = ""; //unhide row
			  } else {
				peoplerow[i].style.display = "none"; // hide row
			  }					
			}
		  }
		  

		}
	  }	

  var animaltable = document.getElementById("matchAnimalTable_ID");
  var animalrow =   animaltable.getElementsByTagName("tr"); 

  // Loop through all table rows, and hide those who don't match the search query
	for (i = 0; i < animalrow.length; i++) {
		
		var currzip = animalrow[i].getElementsByTagName("td")[4]; 
		var currspec = animalrow[i].getElementsByTagName("td")[3]; 		 // note the different col indices for animal vs people
		
		if (currzip && currspec) {
			
		  var currziptxtValue = currzip.textContent || currzip.innerText;
		  var currspectxtValue = currspec.textContent || currspec.innerText;		  
		  
		  animalrow[i].style.display = "none"; // hide row at first
		  for(j = 0; j < zipcode_values.length; j++){
			  
			zipcode = zipcode_values[j].toString();  
	
			 
			if(animalrow[i].style.display != ""){		// if this row hasn't already been unhidden keep checking		
				if (currziptxtValue.indexOf(zipcode) > -1 && currspectxtValue.indexOf(species) > -1) {
				animalrow[i].style.display = ""; //unhide row
			  } else {
				animalrow[i].style.display = "none"; // hide row
			  }					
			}
		  }
	  
			  
		  }
		}
	 

};
