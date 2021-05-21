const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);
const product = urlParams.get('term');

var myURL = 'http://localhost:4201/api/ne?term=' + product;

var dateTime = [];
var sentiment_avg = [];
var count = [];
var sentiment = [];


$.getJSON(myURL, function (data) {
    $.each(JSON.parse(data), function (i, field) {
        date = field.date.split('T')
        dateTime.push(date[0]);
        sentiment_avg.push(field.sentiment / field.count);
        count.push(field.count);
        sentiment.push(field.sentiment);
    });
    $('#title').html('<h1 align="center">' + product + '</h1>');
      // your code
    googleChart();
    average();
});

function average() {
  sentimentSum = sentiment.reduce((a, b) => a + b, 0);
  countSum = count.reduce((a, b) => a + b, 0);
  avgg = sentimentSum /countSum;
  $('#Avg').html('<br><h6 align="center">' + avgg +  '</h6>');
}

//Reference: https://developers.google.com/chart/interactive/docs/gallery/linechart
function googleChart() {
    google.charts.load('current', { packages: ['corechart', 'line'] });
    google.charts.setOnLoadCallback(drawBasic);
    function drawBasic() {
        var data = new google.visualization.DataTable();
        var data2 = new google.visualization.DataTable();

        data.addColumn('string', 'dateTime');
        data2.addColumn('string', 'dateTime');
        data.addColumn('number', 'sentiment_avg');
        data2.addColumn('number', 'count');

        for (i = 0; i < dateTime.length; i++) {
            data.addRow([dateTime[i], sentiment_avg[i]]);
            data2.addRow([dateTime[i], count[i]]);
        }

        var options = {
            title: product,
            hAxis: {
                title: 'Date Time '
            },
            vAxis: {
                title: 'Average Sentiment'
            }
        };

        var options2 = {
            title: product,
            hAxis: {
                title: 'Date Time '
            },
            vAxis: {
                title: 'Count'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        var chart2 = new google.visualization.LineChart(document.getElementById('chart2_div'));
        chart.draw(data, options);
        chart2.draw(data2, options2);
    }
}
