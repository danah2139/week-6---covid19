let proxy = 'https://api.allorigins.win/raw?url=';
let covidUrl = 'https://corona-api.com/countries';
let covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;
let countriesUrl = `${this.proxy}https://restcountries.herokuapp.com/api/v1`;

async function fetchData(url) {
	try {
		let response = await fetch(url);
		if (response.status !== 200) {
			throw new URIError('url not valid');
		}
		const data = await response.json();
	} catch (e) {
		console.log(e);
	}
}

async function getCountryData() {}

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
