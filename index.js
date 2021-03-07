let countryCode;
let proxy = 'https://api.allorigins.win/raw?url=';
let worldCovidUrl = 'https://corona-api.com/countries';
let countriesUrl = `${proxy}https://restcountries.herokuapp.com/api/v1`;
let covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;

const buttonsInfoTypeContainer = document.querySelector(
	'.buttons-container.infoType'
);
const buttonsContinentContainer = document.querySelector(
	'.buttons-container.continent'
);
const chartContainer = document.querySelector('.chart-container');
const countriesList = document.querySelector('select#countries');
const countryDataContainer = document.querySelector('.countryData-container');
const spinnerContainerElement = document.querySelector('.spinner-container');
const countryDataElement = document.querySelector('.countryData');
// ----------------------------------------------------------
// set current display to default
// ----------------------------------------------------------
let world = {};
let currentDisplay = {
	infoType: 'confirmed',
	continent: 'World',
};
let newChartInstance;
let covidChartElement;

let currentData = {
	dataLabels: [],
	dataValues: [],
	dataCode: [],
};

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

function createWorldObj(worldData) {
	world = {
		Africa: [],
		Asia: [],
		Europe: [],
		Africa: [],
		Americas: [],
		Oceania: [],
		'': [],
	};
	for (let countery of worldData) {
		//console.log(countery.region);
		//let name = countery.name.common;
		world[countery.region].push(countery.cca2);
		//continent = {};
	}
	//console.log(world);
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

async function onLoad() {
	spinnerContainerElement.classList.remove('hidden');

	// chart type buttons
	const chartTypesArray = ['confirmed', 'critical', 'deaths', 'recovered'];
	createButtonsGroup(chartTypesArray, 'infoType');
	// continent buttons
	const continentsArray = ['Asia', 'Europe', 'Africa', 'Americas', 'World'];
	createButtonsGroup(continentsArray, 'continent');
	// fetch data of default chart display (confirmed world)
	currentData = await createChartData('World', 'confirmed');
	// fill chart and country dropdown
	covidChartElement = createNewChart(currentData, 'confirmed', 'World');
	spinnerContainerElement.classList.add('hidden');
}

async function createChartData(continent, infoType) {
	// go over country codes in given continent. for each code fetch relevant info and country name. put each in the relevant array.
	spinnerContainerElement.classList.remove('hidden');
	let dataLabelsArray = [];
	let dataValuesArray = [];
	let dataCodeArray = [];
	if (continent === 'World') {
		const continentFullCoronaData = await fetchData(worldCovidUrl);
		// save name and value of infoType given
		for (let country of continentFullCoronaData.data) {
			dataCodeArray.push(country.code);
			dataLabelsArray.push(country.name);
			dataValuesArray.push(country.latest_data[infoType]);
		}
	} else {
		// save name and value of infoType given
		let data = await fetchData(countriesUrl);
		createWorldObj(data);
		//console.log(world[continent]);
		//console.log(world);
		let continentArr = world[continent];
		for (let country of continentArr) {
			countryCode = country;
			covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;
			countryCoronaData = await fetchData(covidPerCounteryUrl);
			console.log(infoType);
			if (countryCoronaData) {
				dataCodeArray.push(countryCode);
				dataLabelsArray.push(countryCoronaData.data.name);
				dataValuesArray.push(countryCoronaData.data.latest_data[infoType]);
			}
		}
		//console.log(dataValuesArray);
	}

	// create dropdown of countries
	fillDropdownCountries(dataLabelsArray);

	spinnerContainerElement.classList.add('hidden');

	return {
		dataCode: dataCodeArray,
		dataLabels: dataLabelsArray,
		dataValues: dataValuesArray,
	};
}

function fillDropdownCountries(countriesArray) {
	countriesList.addEventListener('change', handleCountryChoice);
	countriesList.innerHTML =
		'<option value="SelectOption" selected>-- Select a Country --</option>';
	for (const country of countriesArray) {
		const html = `<option value="${country}">${country}</option>`;
		countriesList.insertAdjacentHTML('beforeend', html);
	}
}
// ----------------------------------------------------------
// event listener functions
// ----------------------------------------------------------
// click a button handler
async function handleClick(event) {
	spinnerContainerElement.classList.remove('hidden');
	const btnName = event.currentTarget.getAttribute('name');

	const btnType = event.currentTarget.getAttribute('data-btnType');
	countryDataContainer.classList.add('hidden');
	if (btnType === 'infoType') {
		currentDisplay.infoType = btnName;
	}
	if (btnType === 'continent') {
		currentDisplay.continent = btnName;
	}
	const newData = await createChartData(
		currentDisplay.continent,
		currentDisplay.infoType
	);
	updateChart(newData);
	spinnerContainerElement.classList.add('hidden');
}
function updateChart(newData) {
	replaceAllData(
		newData.dataLabels,
		newData.dataValues,
		currentDisplay.infoType,
		currentDisplay.continent
	);
}
function handleCountryChoice(event) {
	spinnerContainerElement.classList.remove('hidden');
	const chosenCountry = event.target.value;
	countryDataContainer.classList.remove('hidden');
	displayCountryData(chosenCountry);
	spinnerContainerElement.classList.add('hidden');
}
async function displayCountryData(chosenCountryName) {
	if (chosenCountryName === 'SelectOption') return;
	const countryIndex = currentData.dataLabels.findIndex(
		(countryName) => countryName === chosenCountryName
	);
	countryCode = currentData.dataCode[countryIndex];
	covidPerCounteryUrl = `https://corona-api.com/countries/${countryCode}`;
	const countryData = await fetchData(covidPerCounteryUrl);
	const countryObj = createCountryObj(countryData);
	const html = `
	<h2 class="countryData-header">${countryObj.name}</h2>
	<div class="countryData-content">
	  <h5>Total Confirmed Cases: 
		<p>${countryObj.confirmed}</p>
	  </h5>
	  <h5>New Confirmed Cases: 
		<p>${countryObj.newConfirmed}</p>
	  </h5>
	  <h5>Total Critical Cases: 
		<p>${countryObj.critical}</p>
	  </h5>
	  <h5>Total Deaths: 
		<p>${countryObj.deaths}</p>
	  </h5>
	  <h5>New Deaths: 
		<p>${countryObj.newDeaths}</p>
	  </h5>
	  <h5>Total Recovered: 
		<p>${countryObj.recovered}</p>
	  </h5>
	</div>`;
	countryDataElement.innerHTML = html;
	// console.log(countryObj);
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

function replaceAllData(labelsArray, dataArray, infoType, continent) {
	//console.log(continent);
	newChartInstance.data.labels = labelsArray;
	newChartInstance.data.datasets[0].data = dataArray;
	newChartInstance.data.datasets[0].label = `${infoType} in ${continent}`;
	newChartInstance.update();
}

function createButtonElement(name, type) {
	const btn = document.createElement('button');
	btn.classList.add('btn');
	btn.setAttribute('type', 'button');
	btn.setAttribute('name', name);
	btn.setAttribute('data-btnType', type);
	btn.textContent = name;
	btn.addEventListener('click', handleClick);
	document.querySelector(`.${type}`).appendChild(btn);
}
// create buttons group function
function createButtonsGroup(array, btnType) {
	array.forEach((button) => {
		createButtonElement(button, btnType);
	});
}
window.addEventListener('load', onLoad);
