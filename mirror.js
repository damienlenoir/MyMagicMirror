/* MODULE CLOCK */

function getTime() {
    let dt = new Date();
    let hours= dt.getHours();
    let min= dt.getMinutes();
    let sec= dt.getSeconds();
    let time = addZero(hours) + ":" + addZero(min) + ":" + addZero(sec) ;
    return time;
}

function addZero(value) {
    if (value < 10) value = "0" + value;
    return value;
}

function displayTime() {
    htmlSet("time", getTime());
}

// setInterval(function(){ displayTime(); }, 1000);

/* MODULE METEO */
function callMeteo() {
    const url = "http://api.openweathermap.org/data/2.5/weather?APPID=c3581901e61477aaa07f4410fe9868c3&id=3021372&lang=fr&units=metric";
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setMeteoNow( JSON.parse(this.responseText) );
        }
    };
    xhttp.open( "GET", url, true);
    xhttp.send();
}

function callMeteoForecast() {
    const url = 'http://api.openweathermap.org/data/2.5/forecast?APPID=c3581901e61477aaa07f4410fe9868c3&id=3021372&lang=fr&units=metric';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setMeteoForecast( JSON.parse(this.responseText) );
        }
    };
    xhttp.open( "GET", url, true);
    xhttp.send();
}

function setMeteoNow(res) {
    console.log(res);
    let vent = convertWindSpeed(res.wind.speed);
    let temp = res.main.temp;
    let descrTemps = res.weather[0].description;
    let icon = res.weather[0].icon;
    let iconSource = "http://openweathermap.org/img/w/" + icon + ".png";
    console.log(iconSource);

    htmlSet("vitesseVentActuel", vent);
    htmlSet("tempActual", temp);
    htmlSet("descriptionActual", descrTemps);

    document.getElementById("weatherImage").src = iconSource;

}

function setMeteoForecast(res) {
    console.log(res)
}

function convertWindSpeed( speed ) {
    return Math.round( speed * 3.6 );
}

/*  MODULE POST-IT
- creation boite mail
- connexion API
- Affichage
- fonction STOP
 */

/* MODULE INDICE VELO

 */

function htmlSet(id, value) {
    document.getElementById(id).innerHTML = value;
}
