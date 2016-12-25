
// global settings
var settings = {
    planetSize : 30,
    planetMass: 100,
    satSize : 9,
    satMass : 1.23,
    gravity : 0.4,
    follow : true,
    Objects : ["planet", "satellite"],
    followObject : "satellite",
    startX : 0,
    startY : 4,
    thrust : 0.01,
    simspeed : 1000 / 60,
    zoom : 0.5,
    lineColor : 0x66bbff,
    retroColor : 0xff4444,
    proColor : 0x44ff44,
    startFuel : 999999999999,
    lineWidth : 2,
    changeAmount : 0.0015
}


var zoomValues = {
    "2":0.75,
    "1.5":0.833,
    "1":1,
    "0.5":1.5,
    "0.25":2.5,
    "0.1":5.5
}

var zoomNum = zoomValues[settings.zoom];

// variables
var stage;
var renderer;

// keys down, WASD
var keys = [false, false, false, false];

// keys down prograde(z) retrograde(x)
var grade = [false, false];

var changeThrust = {
    increase: false,
    decrease: false
}


// amount of fuel left
var fuel = settings.startFuel;

// objects
var planet;
var satellite;
// var line;
var trail;
var trail2;
var counter = 0;
var background;

var relationshipLine;


// "container" with everything on screen
var containerBox;


function changeOffset(ev, setting) {
    ev.preventDefault();
    var key = ev.keyCode;

    // A
    if(key == 65){
       keys[1] = setting;
    }
    // D
    if (key == 68) {
       keys[3] = setting;
    }
    // W
    if (key == 87) {
       keys[0] = setting;
    }
    // S
    if (key == 83) {
       keys[2] = setting;
    }
    // Z
    if (key == 90) {
        grade[0] = setting;
    }
    // X
    if (key == 88) {
        grade[1] = setting;
    }
    // Ctrl
    if (key == 17) {
        changeThrust.decrease = setting;
    }
    // shift
    if (key == 16) {
        changeThrust.increase = setting
    }

}



// load after page is done
$(document).ready(function() {


    setTimeout(removeOverlay, 2000)
    document.getElementById('prograde').addEventListener("touchstart", function() {changeOffset(90, true);});
    document.getElementById('prograde').addEventListener("touchend", function() {changeOffset(90, false);});
    document.getElementById('retrograde').addEventListener("touchstart", function() {changeOffset(88, true);});
    document.getElementById('retrograde').addEventListener("touchend", function() {changeOffset(88, false);});

    // control
    document.addEventListener('keydown', function(ev) {
        changeOffset(ev, true);

        if (ev.keyCode == 70) {

            // cycle through different things to follow.
            // alert(settings.followObject + settings.follow);
            if (settings.followObject == "satellite" && settings.follow) {
                settings.followObject = settings.followObject == "planet" ? "satellite" : "planet";
            }
            else if (settings.followObject == "planet" && settings.follow) {
                settings.follow = false;
                settings.followObject = "satellite";
            }
            else if (!settings.follow) {
                settings.follow = true;
                settings.followObject;
            }
        }
    }, false);
    document.addEventListener('keyup', function(ev) {changeOffset(ev, false);}, false);

    // Pixi container.
    stage = new PIXI.Container();
    renderer = new PIXI.autoDetectRenderer(1000, 500, {antialias: true});
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);
    renderer.backgroundColor = 0x24232f
    document.body.appendChild(renderer.view);

    PIXI.loader
        .add("img/bg.png")
        .load(setup)

});
var bgHeight;

function setup() {

    containerBox = new PIXI.Container();

    // create background
    background = new PIXI.TilingSprite(PIXI.loader.resources["img/bg.png"].texture, window.innerWidth * 11, window.innerHeight * 11);
    background.x = -window.innerWidth * 5;
    background.y = -window.innerHeight * 5;
    containerBox.addChild(background);

    // height of the tiling image
    bgHeight = PIXI.loader.resources["img/bg.png"].texture.height;


    // create a trail
    trail = new PIXI.Graphics();
    trail.lineStyle(5, 0xffffff);
    trail.moveTo(settings.startX, settings.startY);
    containerBox.addChild(trail);

    trail2 = new PIXI.Graphics();
    trail2.lineStyle(settings.lineWidth, 0xff9999, 0.4);
    trail2.moveTo(0, 0);
    containerBox.addChild(trail2);

    // relation between the objects
    relationshipLine = new PIXI.Graphics();
    relationshipLine.lineStyle(settings.lineWidth, 0xffffff, 0.1);
    relationshipLine.moveTo(0, 0);
    containerBox.addChild(relationshipLine);

    planet = new PIXI.Graphics();
    planet.beginFill(0x3355ff);
    planet.drawCircle(0, 0, settings.planetSize);
    planet.endFill();
    planet.x = renderer.width/2;
    planet.y = renderer.height/2;
    planet.speedx = 0;
    planet.speedy = 0; //-0.4;
    planet.mass = settings.planetMass;
    containerBox.addChild(planet);

    satellite = new PIXI.Graphics();
    satellite.beginFill(0x99ff99);
    satellite.drawCircle(0, 0, settings.satSize);
    satellite.endFill();
    satellite.x = renderer.width/2 - 100;
    satellite.y = renderer.height/2;
    satellite.speedx = settings.startX;
    satellite.speedy = settings.startY;
    satellite.mass = settings.satMass;
    containerBox.addChild(satellite);


    stage.addChild(containerBox);
    containerBox.scale.x = containerBox.scale.y = settings.zoom;
    containerBox.x = renderer.width/2;
    containerBox.y = renderer.height/2;
    containerBox.pivot.x = renderer.view.width/2;
    containerBox.pivot.y = renderer.view.height/2;
    containerBox.scale.y = containerBox.scale.x = settings.zoom;

    window.onresize = function (){
        var w = window.innerWidth;
        var h = window.innerHeight;    //this part resizes the canvas but keeps ratio the same
        renderer.view.style.width = w + "px";
        renderer.view.style.height = h + "px";    //this part adjusts the ratio:
        renderer.resize(w,h);
        containerBox.pivot.x = renderer.view.width/2;
        containerBox.pivot.y = renderer.view.height/2;

        background.width = window.innerWidth * 11;
        background.height = window.innerHeight * 11
    }

    $(".btn1").on("click touchstart", function() {
        trail.clear();
        trail2.clear();
        trail2.lineStyle(settings.lineWidth, 0xff9999, 0.4);
    });
    setTimeout( logic, settings.simspeed );

    render();
}


// render loop
function render() {
    logic()

    renderer.render(stage);

    requestAnimationFrame(render);
}


// logic loop
function logic() {
    // manual control
    // A
    if(keys[1]){
        satellite.speedx -= settings.thrust;
    }
    // D
    if (keys[3]) {
        satellite.speedx += settings.thrust;
    }
    // W
    if (keys[0]) {
        satellite.speedy -= settings.thrust;
    }
    // S
    if (keys[2]) {
        satellite.speedy += settings.thrust;
    }

    // trail
    if(counter % 4 === 0) {
        trail.lineStyle(settings.lineWidth, settings.lineColor, 0.2);
    }
    else {
        trail.lineStyle(settings.lineWidth, settings.lineColor, 0.1);
    }



    // Orbital "Dynamics"
    var diffX = planet.x - satellite.x;
    var diffY = planet.y - satellite.y;


    // calculate distance between circles
    var r = Math.hypot(diffX, diffY);

    //var r = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)); // full equation

    // Prevent it from flying into infinity
    r = Math.max(r / 10, 1.5);

    // calculate angle
    var anglex = Math.atan(diffX/Math.abs(diffY));
    var angley = Math.atan(diffY/Math.abs(diffX));

    // speed of "satellite"
    var speed = Math.round(Math.hypot(satellite.speedx, satellite.speedy) * 100)/100;
    //var speed = Math.round(Math.sqrt(Math.pow(satellite.speedx, 2) + Math.pow(satellite.speedy, 2)) * 100)/100; // full equation

    // relative speed
    var relSpeed = Math.round(Math.hypot(satellite.speedx - planet.speedx, satellite.speedy - planet.speedy) * 100)/100
    //var relSpeed = Math.round(Math.sqrt(Math.pow(satellite.speedx - planet.speedx, 2) + Math.pow(satellite.speedy - planet.speedy, 2)) * 100)/100


    // change acceleration
    satellite.speedx += Math.sin(anglex)*settings.gravity*planet.mass/Math.max(Math.pow(r, 2), 1);
    satellite.speedy += Math.sin(angley)*settings.gravity*planet.mass/Math.max(Math.pow(r, 2), 1);

    // velocity angle/vector
    var velAnglex = Math.atan(satellite.speedx/Math.abs(satellite.speedy));
    // var veltest0 = Math.sin(velAnglex) * settings.thrust;
    // var veltest1 = settings.thrust * satellite.speedx/(Math.abs(satellite.speedx) + Math.abs(satellite.speedy));
    var velAngley = Math.atan(satellite.speedy/Math.abs(satellite.speedx));


    // "earth" acceleration
    diffX = satellite.x - planet.x;
    diffY = satellite.y - planet.y;

    // calculate angle
    anglex = Math.atan((diffX)/Math.abs(diffY));
    angley = Math.atan(diffY/Math.abs(diffX));

    planet.speedx += Math.sin(anglex)*settings.gravity*satellite.mass/Math.max(Math.pow(r, 2), 1);
    planet.speedy += Math.sin(angley)*settings.gravity*satellite.mass/Math.max(Math.pow(r, 2), 1);

    // prograde/retrograde

    if(fuel >= 0) {
        if(grade[0]) {
            satellite.speedx += Math.sin(velAnglex) * settings.thrust;
            satellite.speedy += Math.sin(velAngley) * settings.thrust;
            fuel -= settings.thrust;
        }
        else if(grade[1]) {
            satellite.speedx -= Math.sin(velAnglex) * settings.thrust;
            satellite.speedy -= Math.sin(velAngley) * settings.thrust;
            fuel -= settings.thrust;
        }

        if(grade[0] || keys[0] || keys[1] || keys[2] || keys[3]) {
            trail.lineStyle(settings.lineWidth, settings.proColor, 0.4);
        }
        else if(grade[1]) {
            trail.lineStyle(settings.lineWidth, settings.retroColor, 0.4);
        }
    }

    if(changeThrust.decrease && settings.thrust > 0) {
        settings.thrust -= settings.changeAmount;
    }

    if(changeThrust.increase) {
        settings.thrust += settings.changeAmount
    }

    $(".display").html("speed: " + speed + "<br>relspeed: " + relSpeed + "<br> Fuel:" + (Math.round(fuel*10)) + "<br> Thrust:" + (Math.round(settings.thrust*1000) / 10) + "<br>R: " + Math.round(r));

    $("#fuelamount").css("width", (fuel/settings.startFuel*100) + "%")

    // draw trail
    trail.moveTo(satellite.x,satellite.y);
    trail2.moveTo(planet.x,planet.y);

    // move objects
    planet.x += planet.speedx;
    planet.y += planet.speedy;
    satellite.x += satellite.speedx;
    satellite.y += satellite.speedy;



    if (counter % 20 == 0) {
        background.x = -window.innerWidth * 5 + Math.round(satellite.x/bgHeight) * bgHeight;
        background.y = -window.innerHeight * 5 + Math.round(satellite.y/bgHeight) * bgHeight;
    }

    // if (bgOffset.x >= bgHeight) {
    //     background.x += bgHeight;
    //     bgOffset.x = 0;
    // }
    // else if (bgOffset.x <= -bgHeight) {
    //     background.x -= bgHeight;
    //     bgOffset.x = 0;
    // }

    // dampening

    // satellite.speedx *= 0.9999;
    // satellite.speedy *= 0.9999;

    // fake drag:
    if (r < 0) {
        var drag = 1 - (0.005/Math.pow(r + 3, 2) * speed);
        satellite.speedx *= drag;
        satellite.speedy *= drag;
    }

    if(settings.follow) {
        follow(window[settings.followObject]);
    }


    // new trail segment
    trail.lineTo(satellite.x , satellite.y);
    trail2.lineTo(planet.x, planet.y);

    // relation between objects
    relationshipLine.clear();
    relationshipLine.lineStyle(Math.min(Math.max(200/r, 1), 10), 0xffffff, Math.max(Math.min(3/r, 0.9), 0.05));

    relationshipLine.moveTo(satellite.x, satellite.y);

    relationshipLine.lineTo(planet.x, planet.y);

    // detect collision

    if (r < 0){
        satellite.speedx = 0;
        satellite.speedy = 2;
        satellite.x -= 200;
    }
    counter += 1;
    // setTimeout( logic, simspeed );

}



// remove touch overlay color
function removeOverlay() {
    $("#prograde").html("");
    $("#prograde").css("background-color", "rgba(0, 0, 0, 0)");
    $("#retrograde").html("");
    $("#retrograde").css("background-color", "rgba(0, 0, 0, 0)");
}

function follow(object) {
    containerBox.x = (renderer.view.width * zoomNum - object.x)*settings.zoom;
    containerBox.y = (renderer.view.height * zoomNum - object.y)*settings.zoom;
}
