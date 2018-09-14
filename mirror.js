/* MODULE CLOCK */
const months = ['janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
const days = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];

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
    htmlSet( "date", days[day] + " " + date + " " + months[month] );
}

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

    let html =
        '<div><img src="img/wind.png"  class="icon"></div>\n' +
        '<div>' + vent + ' Km/h </div> \n' +
        '<div><img src="img/thermo.png" class="icon-thermo"></div>\n' +
        '<div>' + temp + ' °C</div>\n' +
        '<div><img class="icon" src="' + iconSource + '"></div>\n' +
        '<div id="descriptionActual">' + descrTemps + '</div>';

    htmlSet('actualMeteo', html);
}

function setMeteoForecast(res) {
    let today = new Date();
    for ( let f of res.list) {
        let jourPrev = new Date( f.dt * 1000);
        jourPrev.setHours(jourPrev.getHours() - 2 );
        let n = Math.round( (jourPrev.getTime() - today.getTime()) / ( 1000 * 60 * 60 * 24) );
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
            if ( descrCode >= 600 && descrCode < 700 ) {
                logicalCode = replaceFirstChar(descrCode, '60')
            }
            if ( descrCode >= 200 && descrCode < 300 ) {
                logicalCode = replaceFirstChar(descrCode, '50')
            }
            if ( descrCode >= 500 && descrCode < 600 ) {
                logicalCode = replaceFirstChar(descrCode, '40')
            }
            if ( descrCode >= 300 && descrCode < 400 ) {
                logicalCode = replaceFirstChar(descrCode, '30')
            }
            if ( descrCode >= 700 && descrCode < 800 ) {
                logicalCode = replaceFirstChar(descrCode, '20')
            }
            if ( descrCode >= 800 ) {
                logicalCode = replaceFirstChar(descrCode, '10')
            }
            if ( !previsions[n].logicalCode || logicalCode > previsions[n].logicalCode ) {
                previsions[n].logicalCode = logicalCode;
                previsions[n].description = descrText;
                previsions[n].icon = descrIcon;
            }

            if ( (jourPrev.getHours() >= 7 && jourPrev.getHours() <= 9) || (jourPrev.getHours() >= 17 && jourPrev.getHours() <= 19) ) {
                if ( f.main.temp < 12 || descrCode < 800) {
                    previsions[n].velo = false;
                }
            }

        }
    }

    for ( let i = 1 ; i < previsions.length ; i++ ) {
        previsions[i].wind = convertWindSpeed(previsions[i].wind);
        if ( previsions[i].description) buildForecastHTML( previsions[i], i );
    }
}

function buildForecastHTML( prev, index ) {
    let html =
        '<div class="wind"> ' + prev.wind + ' Km/h </div> \n' +
        '<div class="thermo"> <img src="img/thermo.png" class="icon-thermo"></div>\n' +
        '<div class="temp">' + prev.tempMin + ' / ' +  prev.tempMax + ' °C</div>\n' +
        '<div class="description-temp" id="descriptionActual">' + prev.description + ' </div>'+
        '<div class="logo-img"><img class="icon" src="img/' + prev.icon + '.png"></div>';
    htmlSet( 'forecast' + index , html );
}

function veloOrCar() {
    let now = new Date();
    let heureActuelle = now.getHours();
    let jourActuel = now.getDay();
    let demain = new Date ( now.getTime() + ( 1000 * 60 * 60 * 24) );
    let jourDemain = demain.getDay();

    if ( heureActuelle >= 18 && !isWeekend( jourDemain ) ) {
        if ( previsions[1].velo ) {
            htmlSet('veloOrCar',
                '<p>Velo</p>')

        }
    } else if ( heureActuelle < 14 && !isWeekend( jourActuel ) ) {
        if ( previsions[0].velo ) {
            htmlSet('veloOrCar',
                '<p>Velo</p>')
        }
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

function isWeekend(jour) {
    let rep = ( jour == 0 || jour == 6 ) ? true : false ;
    return rep;
}
let messageMimie = '<img src="img/mimie.png"  class="icon face">coucou couc ouc';
htmlSet('postIt-mimie', messageMimie)
let messageDam = '<img src="img/dam.png"  class="icon face"><div class="text-msg">blah blah blahblah blah blahblah blah blahblah blah blahblah blah blah</div>';
htmlSet('postIt-dam', messageDam)

/* LAUNCHERS */
setInterval(function(){ getTime(); }, 1000);
//setInterval(function(){ veloOrCar(); }, 1000 * 60 * 5); // velo toutes les 5min
//setInterval(function(){ callMails(); }, 1000 * 60 * 5); // post its toutes les 5min
setInterval(function(){ callMeteo(); }, 1000 * 60 * 30); // meteo actuelle toute les 30 minutes
setInterval(function(){ callMeteoForecast(); }, 1000 * 60 * 60 * 2); //forecast toutes les 2h
callMeteoForecast();
callMeteo();
getDate();