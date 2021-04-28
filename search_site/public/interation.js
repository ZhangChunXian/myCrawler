$(document).ready(function() {
    $("input:button").click(function() {
        $.get('/process_get?title=' + $("input:text").val(), function(data) {
            $("#record2").empty();
            $("#record2").append('<tr class="cardLayout"><td>url</td><td>source_name</td>' +
                '<td>title</td><td>author</td><td>publish_date</td></tr>');
            for (let list of data) {
                let table = '<tr class="cardLayout"><td>';
                Object.values(list).forEach(element => {
                    table += (element + '</td><td>');
                });
                $("#record2").append(table + '</td></tr>');
            }
        });
    });

});