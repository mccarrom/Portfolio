function deleteAnimal(animal_id){
    $.ajax({
        url: '/animal/' + animal_id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};