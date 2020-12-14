function updateAnimal(id){	

    $.ajax({
        url: '/animal/' + id,
        type: 'PUT',
        data: $('#update_animal').serialize(),
        success: function(result){
			// thank you stack overflow: https://stackoverflow.com/questions/25607582/redirection-on-ajax-success-using-window-location-replace
			window.location.replace(window.location.protocol + "//" + window.location.host + "/animal");
        }
    })
};
