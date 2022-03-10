// openweathermap app id
const API_KEY = "274d01c23e86f519e556a3637a5bc7d0";

// Fuction to fetch weather by city name, country code.
const fetchWeatherByCity = async (city)=>{
    if(Array.isArray(city)){
        var result = [];
        for(const cityName of city){
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`);
            if(response.ok) {
                const data = await response.json();
                result.push(data);
            }
        }
        if(result.length > 0){
            return result;
        }
    }else{
        if(city) {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
            if(!response.ok)
                alert("No weather found.");
            else
                return response.json();
        }
    }
}

// Function to fetch list of cities which have similar names during search operation.
const findCitiesList = async (city)=>{
    if(city) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${city}&appid=${API_KEY}&units=metric`);
        if(!response.ok) 
            alert("No city found.");
        else 
            return response.json();
    }
}

// Function to find warmest and coolest weather start time and end time.
// Less number of comparision with time complexity O(n);
const minAndMax = async (dataArray) => {
    //minStart will contain coolest start time
    //min will contain coolest end time
    //maxStart will contain warmest start time
    //max will contain warmest start time
    let max, min, minStart, maxStart, i;
    if(dataArray.length % 2 !== 0) {
        max = min = minStart = maxStart = dataArray[0];
        i = 1;
    }
    else {
        if(dataArray[0].temp < dataArray[1].temp) {
            max = maxStart = dataArray[1];
            min = minStart = dataArray[0];
        }
        else if(dataArray[0].temp > dataArray[1].temp){
            max = maxStart = dataArray[0];
            min = minStart = dataArray[1];
        }else{
            min = max = dataArray[1];
            minStart = maxStart = dataArray[0];
        }
        i = 2
    }
    while(i < dataArray.length) {
        if(dataArray[i].temp < dataArray[i+1].temp) {
            if(dataArray[i].temp <= min.temp){
                min = dataArray[i];
                // Using (minStart.temp != dataArray[i-1].temp) because sometimes same value can occure multiple times.
                if(min.temp != minStart.temp || minStart.temp != dataArray[i-1].temp){
                    minStart = min;
                }
            }
            if(dataArray[i+1].temp >= max.temp){
                max = dataArray[i+1];
                if(max.temp != maxStart.temp || maxStart.temp != dataArray[i].temp){
                    maxStart = max;
                }
            }
        }
        else if(dataArray[i].temp > dataArray[i+1].temp){
            if(dataArray[i].temp >= max.temp){
                max = dataArray[i];
                if(max.temp != maxStart.temp || maxStart.temp != dataArray[i-1].temp){
                    maxStart = max;
                }
            }
            if (dataArray[i+1].temp <= min.temp){
                min = dataArray[i+1];
                if(min.temp != minStart.temp || minStart.temp != dataArray[i].temp){
                    minStart = min;
                }
            }
        }else{
            if(dataArray[i].temp >= max.temp){
                max = dataArray[i+1];
                if(max.temp != maxStart.temp || maxStart.temp != dataArray[i-1].temp){
                    maxStart = dataArray[i];
                }
            }
            if (dataArray[i].temp <= min.temp){
                min = dataArray[i+1];
                if(min.temp != minStart.temp || minStart.temp != dataArray[i-1].temp){
                    minStart = dataArray[i];
                }
            }
        }
        i = i + 2
    }
    // Current weather is stored at index 0. 
    return [dataArray[0], minStart, min, maxStart, max]
}

// Fuction returns array of epoch time(seconds since January 1, 1970) of previous five days. Used in Historical weather data fetching.
const getEpochTime = ()=>{
    let timeArray = [];
    let date = new Date();
    for(let i=0;i<5;i++){
        date.setDate(date.getDate() - 1);
        timeArray.push(Math.floor(date / 1000));
    }
    return timeArray;
}

// Function fetch historical weather data of previous 5 days and find warmest and coolest wheather using minAndMax function.
const minAndMaxWeather = async (lat, lon)=>{
    if(lat && lon) {
        const timeArray = await getEpochTime();
        var result = [];
        let i=0;
        for(const epochTime of timeArray){
            const response = await fetch(`http://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${epochTime}&units=metric&appid=${API_KEY}`);
            if(response.ok) {
                const data = await response.json();
                if(i == 0) {
                    result.push(data.current);
                }
                result.push.apply(result, data.hourly);
            }
            i++;
        }
        if(result.length > 0){
            const minMax = await minAndMax(result);
            return minMax;
        }else{
            alert("No historical data found.")
        }
    }
}