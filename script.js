if(!navigator.onLine) {
    window.location.href = "error.html"
}

window.addEventListener("offline", () => {
    window.location.href = "error.html"
})


const API_KEY = "4de25b3ca3543c1e29a2fdfb487052d6"
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

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
const weatherParametrsList = document.getElementById("weatherParametrsList")
const weatherView = document.getElementById("weatherView")

if (!localStorage.getItem("lastCity")){
    weatherImage.src = `/images/Sadness.png`
}
const lastCity = localStorage.getItem("lastCity")
if(lastCity){
    fetchWeatherByCity(lastCity)
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
    weatherParametrsList.classList.toggle("hidden", !isLoading)
}

closeModal.addEventListener("click", hideModal)

// События

searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim()

    if(!city) {
        showModal("Вы не ввели название города!")
        return
    }
    fetchWeatherByCity(city)
})

cityInput.addEventListener("keydown", e => {
    if (e.key === "Enter")
        searchButton.click()
})

function fetchWeatherByCoords(lat, lon){
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
    fetchWeather(url)
}

function fetchWeatherByCity(city){
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${API_KEY}`
    fetchWeather(url)
}

function setLoadingStyles(blue){
    if (blue){
        weatherView.style.boxShadow = "0 20px 60px rgba(255, 216, 109, 0.3)"
        weatherParametrsList.style.boxShadow = "0 20px 60px rgba(255, 216, 109, 0.3)"
        cityInput.style.boxShadow = "0 20px 60px rgba(255, 216, 109, 0.3)"
        searchButton.style.boxShadow = "0 20px 60px rgba(255, 216, 109, 0.3)"
        getLocationButton.style.boxShadow = "0 20px 60px rgba(255, 216, 109, 0.3)"
    }
    else{
        weatherView.style.boxShadow = "0 20px 60px rgba(109, 201, 255, 0.3)"
        weatherParametrsList.style.boxShadow = "0 20px 60px rgba(109, 201, 255, 0.3)"
        cityInput.style.boxShadow = "0 20px 60px rgba(109, 201, 255, 0.3)"
        searchButton.style.boxShadow = "0 20px 60px rgba(109, 201, 255, 0.3)"
        getLocationButton.style.boxShadow = "0 20px 60px rgba(109, 201, 255, 0.3)"
    }
}

async function fetchWeather(url){
    setLoadingStyles(true)
    setLoading(true)
    try{
        const response = await fetch(url)
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
        renderWeather(data)
    }
    catch(error){
        if(!navigator.onLine){
            window.location.href = "error.html"
        }
        else if(error.message === "Город не найден"){
            showModal("Город, который вы ввели, не найден!")
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
getLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showModal("");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            fetchWeatherByCoords(
                pos.coords.latitude,
                pos.coords.longitude
            );
        },
        () => {
            showModal("Доступ к геолокации запрещён");
        }
    );
});
function renderWeather(data){
    cityName.textContent = data.name
    weatherImage.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    weatherImage.alt = data.weather[0].description
    weatherDescription.textContent = data.weather[0].description
    temperature.textContent = Math.round(data.main.temp)
    humidity.textContent = data.main.humidity
    wind.textContent = data.wind.speed

    localStorage.setItem("lastCity", data.name)
}

