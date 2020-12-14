function deletePeopleLocation(people_id, location_id){
    
	$.ajax({
        url: '/people_location/'  + people_id   +  '&' + location_id  ,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};