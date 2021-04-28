$(document).ready(function() {
    $("input:button").click(function() {
        $.get('/process_get?title=' + $("input:text").val(), function(data) {
            $("#record2").empty();
            $("#record2").append('<tr class="cardLayout"><th>url</th><th>source_name</th>' +
                '<th>title</th><th>author</th><th>publish_date</th></tr>');
            for (let list of data) {
                console.log(list);
                let table = '<tr class="cardLayout"><td>';
                Object.values(list).forEach(element => {
                    table += (element + '</td><td>');
                });
                $("#record2").append(table + '</td></tr>');
            }
        });
    });

});