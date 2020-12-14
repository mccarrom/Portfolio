function deletePeopleSpecies(people_id, species_id){
    
	$.ajax({
        url: '/people_species/'  + people_id   +  '&' + species_id  ,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};