function deleteLocation(location_id){
    $.ajax({
        url: '/location/' + location_id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};