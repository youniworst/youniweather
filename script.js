'use strict';

function transliterateLocationText(text) {

    text = text.toLowerCase()
        .replace(/\u0401/g, 'YO')
        .replace(/\u0419/g, 'I')
        .replace(/\u0426/g, 'TS')
        .replace(/\u0423/g, 'U')
        .replace(/\u041A/g, 'K')
        .replace(/\u0415/g, 'E')
        .replace(/\u041D/g, 'N')
        .replace(/\u0413/g, 'G')
        .replace(/\u0428/g, 'SH')
        .replace(/\u0429/g, 'SCH')
        .replace(/\u0417/g, 'Z')
        .replace(/\u0425/g, 'H')
        .replace(/\u042A/g, '')
        .replace(/\u0451/g, 'yo')
        .replace(/\u0439/g, 'i')
        .replace(/\u0446/g, 'ts')
        .replace(/\u0443/g, 'u')
        .replace(/\u043A/g, 'k')
        .replace(/\u0435/g, 'e')
        .replace(/\u043D/g, 'n')
        .replace(/\u0433/g, 'g')
        .replace(/\u0448/g, 'sh')
        .replace(/\u0449/g, 'sch')
        .replace(/\u0437/g, 'z')
        .replace(/\u0445/g, 'h')
        .replace(/\u044A/g, "'")
        .replace(/\u0424/g, 'F')
        .replace(/\u042B/g, 'I')
        .replace(/\u0412/g, 'V')
        .replace(/\u0410/g, 'a')
        .replace(/\u041F/g, 'P')
        .replace(/\u0420/g, 'R')
        .replace(/\u041E/g, 'O')
        .replace(/\u041B/g, 'L')
        .replace(/\u0414/g, 'D')
        .replace(/\u0416/g, 'ZH')
        .replace(/\u042D/g, 'E')
        .replace(/\u0444/g, 'f')
        .replace(/\u044B/g, 'i')
        .replace(/\u0432/g, 'v')
        .replace(/\u0430/g, 'a')
        .replace(/\u043F/g, 'p')
        .replace(/\u0440/g, 'r')
        .replace(/\u043E/g, 'o')
        .replace(/\u043B/g, 'l')
        .replace(/\u0434/g, 'd')
        .replace(/\u0436/g, 'zh')
        .replace(/\u044D/g, 'e')
        .replace(/\u042F/g, 'Ya')
        .replace(/\u0427/g, 'CH')
        .replace(/\u0421/g, 'S')
        .replace(/\u041C/g, 'M')
        .replace(/\u0418/g, 'I')
        .replace(/\u0422/g, 'T')
        .replace(/\u042C/g, "'")
        .replace(/\u0411/g, 'B')
        .replace(/\u042E/g, 'YU')
        .replace(/\u044F/g, 'ya')
        .replace(/\u0447/g, 'ch')
        .replace(/\u0441/g, 's')
        .replace(/\u043C/g, 'm')
        .replace(/\u0438/g, 'i')
        .replace(/\u0442/g, 't')
        .replace(/\u044C/g, "'")
        .replace(/\u0431/g, 'b')
        .replace(/\u044E/g, 'yu');

    return text[0].toUpperCase() + text.slice(1);
};


class UserInfo {
    constructor() {
        this.timeOpened = new Date();
        this.timezone = (new Date()).getTimezoneOffset() / 60
        this.position()
    }

    async position() {
        let pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true
            });
        });
        let positionData = {
            long: pos.coords.longitude,
            lat: pos.coords.latitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
        };
        this.long = positionData.long
        this.lat = positionData.lat
        reverseGeocode(info.lat, info.long)
            .then(localityData => locality.forEach((e) => {
                e.innerHTML = transliterateLocationText(localityData)
            }))

        createMap()
        changeWeatherData(info.lat, info.long)
        return positionData
    }
}

let info = new UserInfo();

let map = null;
let modalContainer = document.getElementById('modal_container')
let modalLocality = document.getElementById('modal_question');
let coordsArr = null;

function reverseGeocode(lat, long) {
    return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=d9e5cce572b94b6a8b62c4fe615d254a`)
        .then(res => res.json())
        .then(res => res.results[0].components)
        .then(data => {
            if (data.village) {
                return data.village
            } else if (data.town) {
                return data.town
            } else if (data.city) {
                return data.city
            } else if (data.municipality) {
                return data.municipality.split(' ')[0] + ' municipality'
            } else if (data._type == 'state') {
                return data.state
            } else {
                throw new Error('location not founded')
            }
        })
}

function createMap() {
    map = L.map('map').setView([info.lat, info.long], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    let marker = L.marker([info.lat, info.long]).addTo(map);


    async function onMapClick(e) {

        let coords = e.latlng.toString().slice(7, -1)
        coordsArr = coords.split(',')
        coordsArr[1] = coordsArr[1].slice(1)
        console.log(coordsArr);
        let localityText = null;
        let isEnableButton = null;

        let localityQuestion = 'Your location is ';


        marker.remove()
        marker = L.marker(coordsArr).addTo(map);

        await reverseGeocode(coordsArr[0], coordsArr[1])
            .then(localityData => localityText = localityData)
            .catch(localityData => localityText = 'You choosed the incorrect place!!!')
        if (localityText == 'You choosed the incorrect place!!!') {
            modalButton.setAttribute('disabled', 'disabled');
            modalLocality.innerHTML = localityText
        } else {
            modalLocality.innerHTML = localityQuestion + transliterateLocationText(localityText) + '?'
        }
        modalContainer.style.visibility = 'visible'
        modalButton.style.visibility = 'visible'

    }

    map.addEventListener('click', onMapClick);
}



let modalTrigger = document.getElementById('modal-triger')
let modal = document.getElementById('modal')

let modalButton = document.getElementById('modal_accept')

let locality = document.querySelectorAll('.locality')
modalTrigger.addEventListener('click', (e) => {
    modal.style.visibility = 'visible';
})

function closeModal() {
    setTimeout(() => {
        modal.style.visibility = 'hidden';
        modalContainer.style.visibility = 'hidden'
        modalButton.style.visibility = 'hidden'
    }, 0)
}
modal.addEventListener('click', (e) => {
    if (e.target == modal) {
        closeModal()
    }
})

modalButton.addEventListener('click', (e) => {
    locality.forEach((e) => {
        e.innerHTML = modalLocality.innerHTML.slice(17, -1)
    })
    closeModal()
    removePreviousWeatherForecast()
    changeWeatherData(coordsArr[0], coordsArr[1])
})

function removePreviousWeatherForecast() {
    let parent = weatherBlock;
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
}
let weatherBlock = document.getElementById('weather-block')

async function changeWeatherData(lat, long) {
    await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&exclude=hourly&appid=bc12083e70d2d22298c2df1cec7101d9`)
        .then(res => res.json())
        .then(res => res.list)
        .then(data => {
            data.forEach((e) => {
                let div = document.createElement('div');
                div.className = 'weather_block'
                weatherBlock.append(div)
    
                let time = document.createElement('span')
                time.className = 'weather_block_time'
                time.innerHTML = e.dt_txt.slice(5, -3)
                div.append(time)
    
                let description = document.createElement('span')
                description.className = 'weather_block_description'
                description.innerHTML = e.weather[0].description
                div.append(description)
    
                let temp = document.createElement('span')
                temp.className = 'weather_block_temp'
                temp.innerHTML = Math.round(e.main.temp) + ' °C'
                div.append(temp)
    
                let feelsLike = document.createElement('span')
                feelsLike.className = 'weather_block_temp'
                feelsLike.innerHTML ='feels like <br>' + Math.round(e.main.feels_like) + ' °C'
                div.append(feelsLike)
    
                let windSpeed = document.createElement('span')
                windSpeed.className = 'weather_block_windSpeed'
                windSpeed.innerHTML = 'wind <br>' + Math.round(e.wind.speed) + ' m/s'
                div.append(windSpeed)
    
            })
        })
}