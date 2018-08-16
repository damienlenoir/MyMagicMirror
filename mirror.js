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
        description: '',
        logicalCode: '',
        logo: '',
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
    console.log(res)
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


        let descrCode = f.weather[0].id.toString();
        let descrText = f.weather[0].description;
        let descrIcon = f.weather[0].icon;

        // 6 - 2 - 5 - 3 - 7 - 8
        // on cherche quel est le pire groupe possible
        // puis le pire code

        let logicalCode = '';
        // la on replace le premier char pour trier les groupes logiquement
        if ( descrCode >= 600 && descrCode > 700 ) {
            logicalCode = replaceFirstChar(descrCode, '60')
        }
        if ( descrCode >= 200 && descrCode > 300 ) {
            logicalCode = replaceFirstChar(descrCode, '50')
        }
        if ( descrCode >= 500 && descrCode > 600 ) {
            logicalCode = replaceFirstChar(descrCode, '40')
        }
        if ( descrCode >= 300 && descrCode > 400 ) {
            logicalCode = replaceFirstChar(descrCode, '30')
        }
        if ( descrCode >= 700 && descrCode > 800 ) {
            logicalCode = replaceFirstChar(descrCode, '20')
        }
        if ( descrCode >= 800 && descrCode > 900 ) {
            logicalCode = replaceFirstChar(descrCode, '10')
        }


        if ( !previsions[n].logicalCode || logicalCode > previsions[n].logicalCode ) {
            previsions[n].logicalCode = logicalCode;
            previsions[n].description = descrText;
            previsions[n].icon = descrIcon;
        }



    }

    for ( let i = 0 ; i < previsions.length ; i++ ) {
        previsions[i].wind = convertWindSpeed(previsions[i].wind);
        buildForecastHTML( previsions[i], i );
    }
    console.log(previsions)
}

function buildForecastHTML( prev, index ) {
    let html =
        '   <table>\n' +
        '      <tr>\n' +
        '         <td><img src="img/wind.png"  class="icon"></td>\n' +
        '         <td>\n' +
        '             <span> ' + prev.wind + ' </span> Km/h\n' +
        '         </td>\n' +
        '         <td><img src="img/thermo.png" class="icon"></td>\n' +
        '         <td>\n' +
        '             <span>' + prev.tempMin + ' / ' +  prev.tempMax + '</span>°C\n' +
        '         </td>\n' +
        '         <td>\n' +
        '             <img id="weatherImage" src=""></td>\n' +
        '         <td>\n' +
        '             <span id="descriptionActual"></span>\n' +
        '         </td>\n' +
        '      </tr>\n' +
        '  </table>';
    htmlSet( 'forecast' + index , html );

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

function replaceFirstChar( string, replaceWith ) {
    let res = '';
    for ( let c = 0 ; c < string.length ; c++ ) {
        res = (c == 0) ? res + replaceWith : res + string[c];
    }
    return res;
}