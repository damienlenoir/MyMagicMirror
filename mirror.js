/* MODULE CLOCK */
const months = ['janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
const days = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];

function getTime() {
    let dt    = new Date();
    let hours = dt.getHours().toString().padStart(2,"0");
    let min   = dt.getMinutes().toString().padStart(2,"0");
    let sec   = dt.getSeconds().toString().padStart(2,"0");

    htmlSet("time", hours + ":" + min + ":" + sec);

    if (hours == 0 && min == 0) getDate();
}

function getDate() {
    let dt    = new Date();
    let day   = dt.getDay();
    let date  = dt.getDate();
    let month = dt.getMonth();

    htmlSet( "date", days[day - 1] + " " + date + " " + months[month] );
}

setInterval(function(){ getTime(); }, 1000);
getDate();


/* MODULE METEO */
let previsions = [];
for ( let i=0 ; i<6 ; i++ ) {
    previsions[i] = {
        tempMin: 0,
        tempMax: 0,
        wind: 0,
    }
}

function callMeteo() {
    callWebService(
        'http://api.openweathermap.org/data/2.5/weather?APPID=c3581901e61477aaa07f4410fe9868c3&id=3021372&lang=fr&units=metric',
        setMeteoNow
    )
}

function callMeteoForecast() {
    callWebService(
        'http://api.openweathermap.org/data/2.5/forecast?APPID=c3581901e61477aaa07f4410fe9868c3&id=3021372&lang=fr&units=metric',
         setMeteoForecast
    )
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
    //console.log(res)
    let today = new Date();

    for ( let f of res.list) {
        let jourPrev = new Date( f.dt * 1000);
        let n = jourPrev.getDate() - today.getDate();

        // TODO:icon
        // TODO add time range
        previsions[n].tempMin = ( !previsions[n].tempMin || f.main.temp_min < previsions[n].tempMin ) ?
            f.main.temp_min : previsions[n].tempMin ;
        previsions[n].tempMax = ( !previsions[n].tempMax || f.main.temp_max > previsions[n].tempMax ) ?
            f.main.temp_max : previsions[n].tempMax ;
        let baseWind = f.wind.speed;
        previsions[n].wind = ( !previsions[n].wind ) ?
            baseWind : ( f.wind.speed + previsions[n].wind ) / 2 ;

    }

    for ( let i = 0 ; i < previsions.length ; i++ ) {
        previsions[i].wind = convertWindSpeed(previsions[i].wind);
        buildForecastHTML( previsions[i], i );
    }
    //console.log(previsions)
}

function buildForecastHTML( prev, index ) {

    console.log(prev);
    console.log(index);

}

// setInterval(function(){ callMeteo(); }, 1000 * 60 * 30); // meteo actuelle toute les 30 minutes
// setInterval(function(){ callMeteoForecast(); }, 1000 * 60 * 60 * 2); //forecast toutes les 2h


/*  MODULE POST-IT
- creation boite mail
- connexion API
- Affichage
- fonction STOP
 */

/* MODULE INDICE VELO

 */

/* HELPERS */
function htmlSet(id, value) {
    document.getElementById(id).innerHTML = value;
}

function callWebService(url, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback( JSON.parse(this.responseText) );
        }
    };
    xhttp.open( "GET", url, true);
    xhttp.send();
}

function convertWindSpeed( speed ) {
    return Math.round( speed * 3.6 );
}