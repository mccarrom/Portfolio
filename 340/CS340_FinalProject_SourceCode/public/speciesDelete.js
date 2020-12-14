function deleteSpecies(species_id){
    $.ajax({
        url: '/species/' + species_id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};