/* MODULE CLOCK */
const months = ['janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
const days = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];

function getTime() {
    let dt = new Date();
    let hours= dt.getHours();
    let min= dt.getMinutes();
    let sec= dt.getSeconds();
    htmlSet("time", addZero(hours) + ":" + addZero(min) + ":" + addZero(sec));
    if (hours == 0 && min == 0 && sec == 0) {
        getDate();
    }
}

function getDate() {
    let dt = new Date();
    let day= dt.getDay();
    let date= dt.getDate();
    let month= dt.getMonth();
    htmlSet( "date", days[day - 1] + " " + date + " " + months[month] );
}

function addZero(value) {
    if (value < 10) value = "0" + value;
    return value;
}

setInterval(function(){ getTime(); }, 1000);
getDate();


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

    htmlSet("vitesseVentActuel", vent);
    htmlSet("tempActual", temp);
    htmlSet("descriptionActual", descrTemps);
    document.getElementById("weatherImage").src = iconSource;

}

function setMeteoForecast(res) {
    console.log(res)

    // for each day between 7am and 10pm
    for ( let f of res.list) {
        let dt = new Date();
        let fdate = date.parse(f.dt);
        console.log(fdate)
        console.log(dt)
        if ( fdate.getDay() == dt.getDay() ) {
            console.log(f);
        }
    }
    // take min

    // take max

    // average wind

    // icon

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
