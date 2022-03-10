const icons = {
    Thunderstorm: `<i class="fa-solid fa-bolt">`,
    Drizzle: `<i class="fa-solid fa-cloud-rain"></i> `,
    Rain: `<i class="fa-solid fa-cloud-showers-heavy"></i>`,
    Snow: `<i class="fa-solid fa-snowflake"></i>`,
    Clear: `<i class="fa-solid fa-sun"></i>`,
    Clouds: `<i class="fa-solid fa-cloud-sun"></i>`,
    Others: `<i class="fa-solid fa-smog"></i>`,
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//Function to convert epoch time to display format of date and time
const getCurrentDateAndTime  = (dt) => {
    const d = new Date(0);
    if(dt){
        d.setUTCSeconds(dt);
    }
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

//Load previous searches from IndexedDB and show them on page.
const loadAndSetInitialData = async() => {
    const prevSearch = await loadData();
        fetchWeatherByCity(prevSearch).then((data)=>{
            if(data){
                let myHTML = '';
                for(const weatherData of data){
                    myHTML += `<div class="prev-weather-data p-2 mx-1"><h5 class="my-1">${weatherData.name}, ${weatherData.sys.country}</h5><p class="m-0">lat: ${weatherData.coord.lat}, lon: ${weatherData.coord.lon}</p><h5 class="my-1">${weatherData.weather[0].main in icons ? icons[weatherData.weather[0].main]: icons['Others']} ${weatherData.main.temp}&#176;C (${weatherData.weather[0].description})</h5><p class="m-0">Min: ${weatherData.main.temp_min}, Max: ${weatherData.main.temp_max}</p></div>`
                }
                if(prevSearch.length > 0) {
                    $("#prev-data-set").html(myHTML);
                }else{
                    $("#prev-data-set").html("No history found.");
                }
            }
        })
}

//Set Weather details when previous search element is clicked.
$("#prev-data-set").on("click", ".prev-weather-data", function(){
    let coordValue =$( $(this).find("p")[1] )[0].innerText;
    let cityName =$( $(this).find("h5")[0] )[0].innerText.trim();
    const lat = coordValue.slice(coordValue.indexOf("lat:")+4, coordValue.indexOf(",")).trim();
    const lon = coordValue.slice(coordValue.indexOf("lon:")+4, coordValue.indexOf("</span>")).trim();
    setWeatherData(lat, lon, cityName);
});

$( document ).ready(function() {
    loadAndSetInitialData();
});

//Fuction to get and set data of city when click in search list.
const setWeatherData = (lat, lon, cityName)=>{
    minAndMaxWeather(lat, lon).then((data)=>{
        if(data){
            saveData(`${cityName}`);
            //Set current weather data
            const currTime = getCurrentDateAndTime(false);
            const iconTemp = `${data[0].weather[0].main in icons ? icons[data[0].weather[0].main]: icons['Others']} ${data[0].temp}&#176;C (${data[0].weather[0].description})`;
            const sunriseSunset = `Sunrise: ${getCurrentDateAndTime(data[0].sunrise)}, Sunset: ${getCurrentDateAndTime(data[0].sunset)}}`;
            $("#current-time").html(currTime);
            $("#city").html(`${cityName}`);
            $("#lat-lon").html(`lat: ${lat}, lon: ${lon}`);
            $("#icon-temp").html(`${iconTemp}`);
            $("#sunrise-sunset").html(`${sunriseSunset}`);
            $("#feels-like").html(`Feels like ${data[0].feels_like}&#176;C`);
            $("#wind").html(`Wind: ${data[0].wind_speed}m/s`);
            $("#humidity").html(`Humidity: ${data[0].humidity}%`);
            $("#visibility").html(`Visibility: ${data[0].visibility}m`);
            $("#dew-point").html(`Dew point: ${data[0].dew_point}&#176;C`);
            $("#pressure").html(`Pressure: ${data[0].pressure}hPa`);
            $("#uvi").html(`UV: ${data[0].uvi}`);
            //Set coolest temperature and time
            const coolData = `<span>Coolest Temperature: ${data[1].temp}&#176;C</span><br/><span>Time: From ${getCurrentDateAndTime(data[3].dt)} To ${getCurrentDateAndTime(data[2].dt)}</span>`
            $("#coolest-temp").html(coolData);
            //Set warmest temperature and time
            const warmData = `<span>Warmest Temperature: ${data[3].temp}&#176;C</span><br/><span>Time: From ${getCurrentDateAndTime(data[3].dt)} To ${getCurrentDateAndTime(data[4].dt)}</span>`
            $("#warmest-temp").html(warmData);
            $("#loading").addClass("d-none");
            $("#main-weather").removeClass("d-none").addClass("d-flex");
            loadAndSetInitialData();
        }
    })
}

//Get and set data all cities matches with input.
$("#search-button").click( () => {
    findCitiesList($(".search-bar").val()).then((data)=>{
        if(data.count == 0){
            $("#city-list").html('');
            alert("No city found.")
        }else{
            let myHTML = '';
            for(const city of data.list){
                myHTML += `<li class="choose-city list-group-item"><div class="d-flex justify-content-between"><div><span>${city.name}, ${city.sys.country}</span><br/><span>lat: ${city.coord.lat}, lon: ${city.coord.lon}</span></div><div><span class="float-right">${city.main.temp}&#176;C</span><br/><span>${city.weather[0].main in icons ? icons[city.weather[0].main]: icons['Others']} ${city.weather[0].description.toUpperCase()}</span></div></div></li>`;
            }
            $("#city-list").html(myHTML);
        }
    })
});

//Runs when search list element is clicked.
$("#city-list").on("click", ".choose-city", function(){
    $("#city-list").html('');
    $("#main-weather").removeClass("d-flex").addClass("d-none");
    $("#loading").removeClass("d-none");
    let coordValue =$( $(this).find("span")[1] )[0].innerText;
    let cityName =$( $(this).find("span")[0] )[0].innerText.trim();
    const lat = coordValue.slice(coordValue.indexOf("lat:")+4, coordValue.indexOf(",")).trim();
    const lon = coordValue.slice(coordValue.indexOf("lon:")+4, coordValue.indexOf("</span>")).trim();
    setWeatherData(lat, lon, cityName);
});