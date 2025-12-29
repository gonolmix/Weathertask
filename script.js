if(!navigator.onLine) {
    window.location.href = "error.html"
}

window.addEventListener("offline", () => {
    window.location.href = "error.html"
})


const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
let abortController = null
let signal = null
let inputTimeout = null

const cityInput = document.getElementById("cityInput")
const searchButton = document.getElementById("searchButton")
const getLocationButton = document.getElementById("getLocationButton")
const loader = document.getElementById("loader")
const errorModal = document.getElementById("errorModal")
const errorModalContent = document.getElementById("errorModalContent")
const errorDetails = document.getElementById("errorDetails")
const weatherImage = document.getElementById("weatherImage")
const weatherDescription = document.getElementById("weatherDescription")
const cityName = document.getElementById("cityName")
const temperature = document.getElementById("temperature")
const humidity = document.getElementById("humidity")
const wind = document.getElementById("wind")
const closeModal = document.getElementById("closeModalButton")
const weatherResponse = document.getElementById("weatherResponse")
const weatherParametersList = document.getElementById("weatherParametersList")
const weatherView = document.getElementById("weatherView")

const cashedResponce = JSON.parse(localStorage.getItem("lastCityWeatherCached"))

if (!localStorage.getItem("lastCityWeatherCached")){
    weatherImage.src = `/images/Sadness.png`
}

if(cashedResponce){
    renderWeather(cashedResponce.data)
}

// UI Helpers

function setLoading(isLoading) {
    loader.classList.toggle("hidden", !isLoading)
    searchButton.disabled = isLoading
    getLocationButton.disabled = isLoading
}

function showModal(text){
    errorDetails.textContent = text
    errorModal.classList.remove("hidden")
}

function hideModal(){
    errorModal.classList.add("hidden")
}

function setWeatherViews(isLoading){
    weatherResponse.classList.toggle("hidden", !isLoading)
    weatherParametersList.classList.toggle("hidden", !isLoading)
}

closeModal.addEventListener("click", hideModal)

// События

// cityInput.addEventListener("input", () =>{
//     cityInput.setTimeout(300);
// })

searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim()

    if(!city) {
        showModal("Вы не ввели название города!")
        return
    }
    
    fetchWeatherByCoordsOrCity({city: city})
})

cityInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !searchButton.disabled)
        searchButton.click()
})

// function fetchWeatherByCoords(lat, lon){
//     const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
//     fetchWeather(url)
// }

// function fetchWeatherByCity(city){
//     const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${API_KEY}`
//     fetchWeather(url)
// }

function fetchWeatherByCoordsOrCity({city, lat, lon}){
    let query = ""
    if (city){
        query = `q=${encodeURIComponent(city)}`
    }
    else {
        query = `lat=${lat}&lon=${lon}`
    }
    const url = `${BASE_URL}?${query}&units=metric&lang=ru&appid=${API_KEY}`
    fetchWeather(url)
}

function setLoadingStyles(blue){
    if (blue){
        weatherView.classList.add("loading")
        weatherParametersList.classList.add("loading")
        cityInput.classList.add("loading")
        searchButton.classList.add("loading")
        getLocationButton.classList.add("loading")
    }
    else{
        weatherView.classList.remove("loading")
        weatherParametersList.classList.remove("loading")
        cityInput.classList.remove("loading")
        searchButton.classList.remove("loading")
        getLocationButton.classList.remove("loading")
    }
}

function setDescriptionClass (weatherId){
    weatherDescription.classList.remove("sunny", "cloudy")
    if (weatherId === 800){
        weatherDescription.classList.add("sunny")
    }
    if (weatherId > 800 && weatherId < 900){
        weatherDescription.classList.add("cloudy")
    }
}

    // добавлен AbortController, который закрывает предыдущий запрос во время нового поиска
async function fetchWeather(url){

    if (abortController){
        abortController.abort()
    }

    abortController = new AbortController()
    signal = abortController.signal

    setLoadingStyles(true)
    setLoading(true)
    try{
        const response = await fetch(url, {signal})
        if (!response.ok){
            if (response.status === 404){
                throw new Error("Город не найден")
            }
            else if (response.status >= 500){
                throw new Error("Сервер нагружен")
            }
            throw new Error("Неизвестная ошибка")
        }
        const data = await response.json()
        if (!data.weather || !Array.isArray(data.weather) || !data.weather[0]){
            throw new Error("Некорректный ответ API на запрос")
        }
        renderWeather(data)
    }
    catch(error){
        if(!navigator.onLine){
            window.location.href = "error.html"
        }
        else if(error.message === "Город не найден"){
            showModal("Город, который вы ввели, не найден!")
        }
        else if(error.name === "AbortError"){
            return
        }
        else{
            showModal("Ошибка получения данных о погоде")
        }

    }
    finally {
        setLoadingStyles(false)
        setLoading(false)
    }
}
    function handleGeolocationError(error){
        switch (error.code){
            case error.PerMISSION_DENIED:
                showModal("Доступ к геолокации запрещён пользователем");
                break;
            case error.POSITION_UNAVAILABLE:
                showModal("Местоположение недоступно");
                break;
            case error.TIMEOUT:
                showModal("Истекло время ожидания определения местоположения");
                break;
            default:
                showModal("Неизвестная ошибка геолокации");
    }
        }

    getLocationButton.addEventListener("click", () => {
        if (!navigator.geolocation) {
            showModal("");
        return;
        }

    navigator.geolocation.getCurrentPosition(
        pos => {
            fetchWeatherByCoordsOrCity({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
                }
            );
        },
        handleGeolocationError,{
            timeout: 10000
        }
    );
});

// добавлены классы погоды
// теперь в кэше хранится запрос, а не название города
function renderWeather(data){
    cityName.textContent = data.name
    weatherImage.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    weatherImage.alt = data.weather[0].description

    let weatherId = data.weather[0].id
    setDescriptionClass(weatherId)
    
    weatherDescription.textContent = data.weather[0].description
    temperature.textContent = Math.round(data.main.temp)
    humidity.textContent = data.main.humidity
    wind.textContent = data.wind.speed

    localStorage.setItem("lastCityWeatherCached", JSON.stringify({
        data,
        timestamp: Date.now()
    }))
}

