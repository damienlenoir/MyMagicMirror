/* MODULE CLOCK */
const months = ['janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

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
function newPrevision() {
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
    return previsions;
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
    let temp = Math.round(res.main.temp);
    let icon = res.weather[0].icon;
    let iconSource = "img/" + icon + ".png";

    let html = '<div class="flex1">\n' +
        '          <img src="img/wind.png"  class="icon">\n' +
        '          <div>' + vent + ' Klm/h</div>\n' +
        '       </div>\n' +
        '       <div class="flex1">\n' +
        '           <img src="img/thermo.png" class="icon-thermo">\n' +
        '           <div>' + temp + ' °C</div>\n' +
        '       </div>\n' +
        '           <div class="flex2">\n' +
        '           <img class="icon" src="' + iconSource + '">\n' +
        '       </div>';

    htmlSet('actualMeteo', html);
}

function setMeteoForecast(res) {
    let previsions = newPrevision();
    let today = new Date();
    for ( let f of res.list) {
        let jourPrev = new Date( f.dt * 1000);
        jourPrev.setHours(jourPrev.getHours() - 2 );
        let n = Math.round( (jourPrev.getTime() - today.getTime()) / ( 1000 * 60 * 60 * 24) );
        if ( jourPrev.getHours() > 6) {
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
                previsions[n].icon = descrIcon.replace("n", "d");
            }

            if ( (jourPrev.getHours() >= 7 && jourPrev.getHours() <= 9) || (jourPrev.getHours() >= 17 && jourPrev.getHours() <= 19) ) {
                if ( f.main.temp < 12 || descrCode < 800) {
                    previsions[n].velo = false;
                }
            }
        }
    }

    for (let i=1 ; i<5 ; i++) {
        previsions[i].wind = convertWindSpeed(previsions[i].wind);
        if ( previsions[i].description) buildForecastHTML( previsions[i], i );
    }
}

function buildForecastHTML( prev, index ) {
    let html = '<div class="flex1 addPadding">\n' +
        '          <span>' + prev.jourSemaine  +'</span>' +
        '       </div>' +
        '       <div class="flex1">\n' +
        '          <img src="img/wind.png"  class="icon">\n' +
        '          <div>' + prev.wind + ' Klm/h</div>\n' +
        '       </div>\n' +
        '       <div class="flex1">\n' +
        '           <img src="img/thermo.png" class="icon-thermo">\n' +
        '           <div>' + Math.round(prev.tempMin) + ' / ' +  Math.round(prev.tempMax) + ' °C</div>\n' +
        '       </div>\n' +
        '       <div class="flex1 noPadding">\n' +
        '           <img class="big-icon" src="img/' +  prev.icon  + '.png">\n' +
        '       </div>\n' +
        '       </div>\n' +
        '       <div class="flex1 addPadding">\n' +
        '           <span>' + prev.description  +'</span>\n' +
        '       </div>';
    htmlSet( 'forecast' + index , html );
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
            emails[i].exp = res[i].from[0];
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
                messageMimie = '<img src="img/mimie.png"  class="icon face"><div class="text-msg">' + postIt.subject + '</div>';
            }
        } else {
            if ( postIt.date > dateMessDam){
                dateMessDam = postIt.date;
                messageDam = '<img src="img/dam.png"  class="icon face"><div class="text-msg">' + postIt.subject + '</div>';
            }
        }
    }

    if (messageDam) {
        htmlSet( 'postIt-dam', messageDam);
    } else {
        htmlSet( 'postIt-dam', '');
    }
    if (messageMimie) {
        htmlSet( 'postIt-mimie', messageMimie);
    } else {
        htmlSet( 'postIt-mimie', '');
    }
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

function extractDate(date) {
    var rx = /\d.*\ /;
    var arr = rx.exec(date);
    return arr[0];
}

function isWeekend(jour) {
    return ( jour === 0 || jour === 6 )
}

function updateCitation() {
    type="day";
    console.log('bim')
    empty = '';
    var request = new XMLHttpRequest();
    request.open('GET', 'https://citations.ouest-france.fr/apis/export.php?json&key=464fzer5&t='+escape(type)+'&author='+empty+'&theme='+empty+'&word='+empty, true);
    request.send(null);

    request.onload = function(){
        if (request.status >= 200 && request.status < 400){
            var data = JSON.parse(request.responseText);
            content = '<div><a href="'+data.getlink+'" rel="nofollow noopener" target="_blank">' + data.quote + '</a></br></br>- <a href="'+data.authorlink+'" rel="nofollow noopener" target="_blank">'+data.name +'</a></div>';
            document.getElementById('QuoteOFDay').innerHTML = content;
        }
    };
}

/* LAUNCHERS */
setInterval(function(){ getTime(); }, 1000);
setInterval(function(){ callMails(); }, 1000 * 60); // post its toutes les min
setInterval(function(){ updateCitation(); }, 1000 * 60 * 60 * 4); // citation tt les 4h
setInterval(function(){ updateCitation(); }, 1000 ); // citation tt les 4h
setInterval(function(){ callMeteo(); }, 1000 * 60 * 30); // meteo actuelle toute les 30 minutes
setInterval(function(){ callMeteoForecast(); }, 1000 * 60 * 60); //forecast toutes les 1h
callMeteoForecast();
callMeteo();
getDate();
callMails();
updateCitation();