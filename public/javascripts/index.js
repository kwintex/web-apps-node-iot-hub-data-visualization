$(document).ready(function () {
  var timeData = [],
    signal1Data = [],
    signal2Data = [];
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        spanGaps: true,
        data: signal1Data
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        spanGaps: true,
        data: signal2Data
      }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Temperature & Humidity Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(C)',
          display: true
        },
        position: 'left',
      }, {
          id: 'Humidity',
          type: 'linear',
          scaleLabel: {
            labelString: 'Humidity(%)',
            display: true
          },
          position: 'right'
        }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  // wss=Azure App Service | ws=Localhost
  var ws = new WebSocket('wss://' + location.host);
  //var ws = new WebSocket('ws://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
	// {"signal":1,"payload":28.75,"time":"2019:03:30T10:34:50"}
    console.log('receive message: ' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time) {
		alert(JSON.stringify(obj))
        return;
      }
      timeData.push(obj.time);
      // only keep no more than n points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        signal1Data.shift();
        signal2Data.shift();
      }

      if (obj.signal == 1) {
		  signal1Data.push(obj.payload);
		  signal2Data.push(null);
      }
      if (obj.signal == 2) {
		  signal2Data.push(obj.payload);
		  signal1Data.push(null);
      }

      myLineChart.update();

    } catch (err) {
      console.error(err);
    }
  }
});
