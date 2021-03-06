let proxy = 'https://api.allorigins.win/raw?url=';
let worldCovidUrl = 'https://corona-api.com/countries';
let countriesUrl = `${proxy}https://restcountries.herokuapp.com/api/v1`;
let covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;

async function fetchData(url) {
	try {
		let response = await fetch(url);
		if (response.status !== 200) {
			throw new URIError('url not valid');
		}
		return await response.json();
	} catch (e) {
		console.log(e);
	}
}

async function createWorldObj() {
	let world = {};
	let continent = {};
	let data = await fetchData(countriesUrl);
	for (let countery of data) {
		world[countery.region] = continent;
		continent[countery.cca2] = countery.name.common;
	}
	return world;
}

function createCountryObj(countryData) {
	if (countryData) {
		// console.log(countryData);
		const countryObj = {
			name: countryData.data.name,
			code: countryData.data.code,
			confirmed: countryData.data.latest_data.confirmed,
			newConfirmed: countryData.data.today.confirmed,
			critical: countryData.data.latest_data.critical,
			deaths: countryData.data.latest_data.deaths,
			newDeaths: countryData.data.today.deaths,
			recovered: countryData.data.latest_data.recovered,
		};
		return countryObj;
	}
}

async function createChartData(continent, infoType) {
	// go over country codes in given continent. for each code fetch relevant info and country name. put each in the relevant array.
	spinnerContainerElement.classList.remove('hidden');
	let dataLabelsArray = [];
	let dataValuesArray = [];
	let dataCodeArray = [];
	if (continent === 'world') {
		const continentFullCoronaData = await fetchData(worldCovidUrl);
		// save name and value of infoType given
		for (let country of continentFullCoronaData.data) {
			dataCodeArray.push(country.code);
			dataLabelsArray.push(country.name);
			dataValuesArray.push(country.latest_data[infoType]);
		}
	} else {
		// save name and value of infoType given
		const continent = world[continent];
		for (let country of continent) {
			const countryCode = country.cca2;
			let covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;
			countryCoronaData = await fetchData(covidPerCounteryUrl);
			if (countryCoronaData) {
				dataCodeArray.push(code);
				dataLabelsArray.push(countryCoronaData.data.name);
				dataValuesArray.push(countryCoronaData.data.latest_data[infoType]);
			}
		}
	}
}

function createNewChart(currentData, infoType, continent) {
	const covidChart = document.createElement('canvas');
	covidChart.setAttribute('id', '#covidChart');
	chartContainer.appendChild(covidChart);
	newChartInstance = new Chart(covidChart, {
		type: 'line',
		data: {
			labels: currentData.dataLabels,
			datasets: [
				{
					label: `${infoType} in ${continent}`,
					backgroundColor: '#1d2d506e',
					borderColor: '#133b5c',
					borderWidth: '1',
					data: currentData.dataValues,
				},
			],
		},
		options: {
			maintainAspectRatio: false,
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
						},
					},
				],
			},
		},
	});
	return covidChart;
}

createWorldObj();
