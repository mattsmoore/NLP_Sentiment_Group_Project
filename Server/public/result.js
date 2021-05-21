const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);
const product = urlParams.get('term');

var myURL = 'http://localhost:4201/api/search/?term=' + product;
var output = '<ul class="list-group list-group-flush"><br/>';

$.getJSON(myURL, function(data) {
    $.each(JSON.parse(data), function(i, field) {
        output += '<li class="list-group-item" align="center"><a href="graph.html?term=' + field.named_entity + '">' + field.named_entity + '</a></li>';
        output += '<br>';
    });
    output += '</ul>';
    $('#app').html(output);
});