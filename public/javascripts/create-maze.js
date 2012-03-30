$('#create').click(function(e) {
    e.preventDefault();
    var form = $('#maze_config_form').serialize();
    console.log(form);
    var jqxhr =  $.post('create-maze', form, function(data) {
        alert(data);
        })

    .success( function(data) { })
    .error( function(data) { });
    });


