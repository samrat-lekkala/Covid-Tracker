import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
function LineGraph({ casesType = "cases", ...props }) {
  const [data, setData] = useState();

  const options = {
    legend: {
      display: false,
    },
    elements: {
      point: {
        raius: 0,
      },
    },
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (toolTipItem, data) {
          return numeral(toolTipItem.value).format("+0, 0");
        },
      },
    },
    scales: {
      xAxes: [
        {
          type: "time",
          time: {
            format: "MM/DD/YY",
            tooltipFormat: "ll",
          },
        },
      ],
      yAxes: [
        {
          gridLines: { display: false },
          ticks: {
            callback: function (value, index, values) {
              return numeral(value).format("0a");
            },
          },
        },
      ],
    },
  };
  const makechartData = (data, casesType = "cases") => {
    const chartData = [];
    let lastData;
    for (let date in data.cases) {
      if (lastData) {
        const newData = {
          x: date,
          y: data[casesType][date] - lastData,
        };
        chartData.push(newData);
      }
      lastData = data[casesType][date];
    }
    return chartData;
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetch(
        "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
      ).then((response) =>
        response.json().then((data) => {
          const chartData = makechartData(data, casesType);
          setData(chartData);
        })
      );
    };
    fetchData();
  }, [casesType]);

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
          options={options}
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204,6, 52, 0)",
                borderColor: "#cc1034",
                data: data,
              },
            ],
          }}
        />
      )}
    </div>
  );
}

export default LineGraph;
