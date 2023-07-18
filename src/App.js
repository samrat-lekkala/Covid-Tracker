import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";

import React, { useEffect, useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData } from "./util";
import LineGraph from "./LineGraph";
import { prettyPrintStat } from "./util";
import Footer from "./Footer";
function App() {
  const [countries, setCountries] = useState(["India", "USA", "RUSSIA"]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState();
  const [tableData, setTableData] = useState();
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  useEffect(() => {
    const countriesInfo = async () => {
      await fetch("https://disease.sh/v3/covid-19/all")
        .then((response) => response.json())
        .then((data) => {
          setCountryInfo(data);
        });
    };
    countriesInfo();
  }, []);

  useEffect(() => {
    const countriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    countriesData();
  }, []);

  const onCountryChange = async (e) => {
    e.preventDefault();

    const countryCode = e.target.value;
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode} `;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <><div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Corona Cases"
            cases={prettyPrintStat(
              countryInfo !== undefined && countryInfo.todayCases
            )}
            total={prettyPrintStat(
              countryInfo !== undefined && countryInfo.cases
            )}
          />
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(
              countryInfo !== undefined && countryInfo.todayRecovered
            )}
            total={prettyPrintStat(
              countryInfo !== undefined && countryInfo.recovered
            )}
          />
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrintStat(
              countryInfo !== undefined && countryInfo.todayDeaths
            )}
            total={prettyPrintStat(
              countryInfo !== undefined && countryInfo.deaths
            )}
          />
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData} />
          <div className="app__graph_margin-top">
            <h3 className="app__graphTitle">Worldwide New {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </div>
        </CardContent>
      </Card>
      
    </div>
    <Footer/>
    </>
  );
}

export default App;
