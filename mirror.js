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

    // if ( dt.getHours() >= 7 && dt.getHours() < 9) veloOrCar(dt);
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
        velo: true,
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
        let n = Math.round( (jourPrev.getTime() - today.getTime()) / ( 1000 * 60 * 60 * 24) );
        if ( jourPrev.getHours() > 6 ) {
            previsions[n].jourSemaine = days[jourPrev.getDay() - 1 ];
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

    for ( let i = 1 ; i < previsions.length ; i++ ) {
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


/* MODULE INDICE VELO
    regarde le temps et la température le matin à 9h, le soir à 18h
    exclure le velo si - de 10 degré /  pluie.

    si entre 7h30 et 8h30 =>
        si demain semaine =>
             cacl sur les 2 prochaines prev (8h et 17h)

 */
function veloOrCar() {
    let now = new Date();

    callMeteoForecast();

    now.setHours(7);
    now.setMinutes(0);
    now.setSeconds(0);
    console.log(now);
    console.log(previsions)

    if ( now.getHours() < 9 ) {
        console.log('matin')
        // prev de 8h et 17h meme jour
    } else if ( now.getHours() > 17 ) {
        console.log('le soir')
        // prev de 8h et 17h du lendemain
    } else {
        console.log('journee')
        // prev de 17h du meme jour
    }


}




/*  MODULE POST-IT */

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

    const whiteList = res[0];
    let postIts = [];

    for ( email of emails ) {
        for ( authorized of whiteList.mail ) {
            if ( authorized === email.exp ) {
                let limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - 2);
                if ( limitDate < email.date) {
                    postIts.push(email);
                }
            }
        }
    }

    let messageMimie= '';
    let dateMessMimie = new Date(0);
    let messageDam= '';
    let dateMessDam = new Date(0);

    for ( let postIt of postIts) {
        if ( postIt.exp.includes('emilie') ) {
            if ( postIt.date > dateMessMimie){
                dateMessMimie = postIt.date;
                messageMimie = '<img src="img/mimie.png"  class="icon">' + postIt.subject;
            }
        } else {
            if ( postIt.date > dateMessDam){
                dateMessDam = postIt.date;
                messageDam = '<img src="img/dam.png"  class="icon">' + postIt.subject;
            }
        }
    }

    if (messageDam) htmlSet( 'postIt-dam', messageDam);
    if (messageMimie) htmlSet( 'postIt-mimie', messageMimie);
}

// TODO : indice velo
// TODO : automatisation de tout
// TODO : optimisation de code
// TODO : CSS
// TODO : Installation sur Raspberry

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