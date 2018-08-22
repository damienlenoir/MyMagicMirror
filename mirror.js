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
        jourSemaine: '',
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
    let vent = convertWindSpeed(res.wind.speed);
    let temp = res.main.temp;
    let descrTemps = res.weather[0].description;
    let icon = res.weather[0].icon;
    let iconSource = "img/" + icon + ".png";
    htmlSet("vitesseVentActuel", vent);
    htmlSet("tempActual", temp);
    htmlSet("descriptionActual", descrTemps);
    document.getElementById("weatherImage").src = iconSource;
}

function setMeteoForecast(res) {
    let today = new Date();
    for ( let f of res.list) {
        let jourPrev = new Date( f.dt * 1000);
        let n = jourPrev.getDate() - today.getDate();
        if ( jourPrev.getHours() > 6 ) {
            previsions[n].jourSemaine = days[jourPrev.getDay()];
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
            let logicalCode = '';
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
    }

    for ( let i = 0 ; i < previsions.length ; i++ ) {
        previsions[i].wind = convertWindSpeed(previsions[i].wind);
        buildForecastHTML( previsions[i], i );
    }
}

function buildForecastHTML( prev, index ) {
    let html =
        '   <table>\n' +
        '      <tr>\n' +
        '         <td>' + prev.jourSemaine + '<img src="img/wind.png"  class="icon"></td>\n' +
        '         <td>\n' +
        '             <span> ' + prev.wind + ' </span> Km/h\n' +
        '         </td>\n' +
        '         <td><img src="img/thermo.png" class="icon-thermo"></td>\n' +
        '         <td>\n' +
        '             <span>' + prev.tempMin + ' / ' +  prev.tempMax + '</span>°C\n' +
        '         </td>\n' +
        '         <td>\n' +
        '             <img id="weatherImage" class="icon" src="img/' + prev.icon + '.png"></td>\n' +
        '         <td>\n' +
        '             <span id="descriptionActual">' + prev.description + ' </span>\n' +
        '         </td>\n' +
        '      </tr>\n' +
        '  </table>';
    htmlSet( 'forecast' + index , html );

}

// setInterval(function(){ callMeteo(); }, 1000 * 60 * 30); // meteo actuelle toute les 30 minutes
// setInterval(function(){ callMeteoForecast(); }, 1000 * 60 * 60 * 2); //forecast toutes les 2h

/*  MODULE POST-IT
 boite outlook: mon.miroir.magique@outlook.com
 need to install node.js and imap module
 */

// TODO: faire une white liste qui vient du serveur pour ne pas mettre les mails dans GIT

function callMails() {
    callWebService('http://127.0.0.1:3000/', displayMails)
}

let emails = [];
for ( let i=0 ; i<9 ; i++ ) {
    emails[i] = {
        exp: 0,
        date: 0,
        subject: 0,
    }
}

function displayMails(res) {
    for ( let i = 1 ; i < 9 ; i++ ) {
        if (res[i]) {
            emails[i].exp = extractExp(res[i].from[0]);
            emails[i].subject = res[i].subject[0];
            emails[i].date = new Date(extractDate(res[i].date));
        }
    }
    console.log(emails)
    // Créer l'affiche en fonction de certain critères
    const whiteList = res[0];

    for ( email of emails ) {

        for ( authorized of whiteList.mail ) {

            if ( authorized === email.exp ) {

                console.log(authorized + ' est autorisé')
                let now = new Date();

                console.log(now)
                console.log(email.date)

            }
        }


    }

    // Le message est il toujours d'actualité ?


}

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

function extractExp(exp) {
    var rx = /\<(.*)\>/;
    var arr = rx.exec(exp);
    return arr[1];
}

function extractDate(date) {
    var rx = /\d.*\ /;
    var arr = rx.exec(date);
    return arr[0];
}