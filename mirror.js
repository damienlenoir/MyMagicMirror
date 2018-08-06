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
    document.getElementById("time").innerHTML= getTime();
}

setInterval(function(){ displayTime(); }, 1000);

/* MODULE METEO */

function callMeteo() {
    const url = 'http://api.openweathermap.org/data/2.5/forecast?APPID=c3581901e61477aaa07f4410fe9868c3&id=3021372&lang=fr&units=metric';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setMeteoValue( JSON.parse(this.responseText) );
            //console.log( this.responseText );
        }
    };
    xhttp.open( "GET", url, true);
    xhttp.send();
}

function setMeteoValue(res) {
    let actualMeteo = res.list[0];
    console.log(actualMeteo);

    
}

/*  MODULE POST-IT
- creation boite mail
- connexion API
- Affichage
- fonction STOP
 */

/* MODULE INDICE VELO

 */