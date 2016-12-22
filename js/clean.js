
// "settings"
var planetsize = 30,
    shipsize = 9,
    gravity = 0.4,
    follow = true,
    startX = 0,
    startY = 4,
    thrust = 0.01,
    simspeed = 1000 / 60,
    zoom = 1,
    lineColor = 0x66bbff,
    retroColor = 0xff4444,
    proColor = 0x44ff44,
    startFuel = 999999999999,
    lineWidth = 2,
    changeAmount = 0.0005;

var zoomValues = {
    "2":0.75,
    "1.5":0.833,
    "1":1,
    "0.5":1.5,
    "0.25":2.5,
    "0.1":5.5
}

var zoomNum = zoomValues[zoom];

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
var fuel = startFuel;

// objects
var circle;
var second;
// var line;
var trail;
var trail2;
var counter = 0;
var background;

var relationshipLine;


// "container" with everything on screen
var containerBox;


function changeOffset(key, setting) {
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

    if (key == 32) {
        changeThrust.decrease = setting;
    }
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
    document.addEventListener('keydown', function(ev) {changeOffset(ev.keyCode, true);  }, false);
    document.addEventListener('keyup', function(ev) {changeOffset(ev.keyCode, false);}, false);

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
    trail.moveTo(startX, startY);
    containerBox.addChild(trail);

    trail2 = new PIXI.Graphics();
    trail2.lineStyle(lineWidth, 0xff9999, 0.4);
    trail2.moveTo(0, 0);
    containerBox.addChild(trail2);

    // relation between the objects
    relationshipLine = new PIXI.Graphics();
    relationshipLine.lineStyle(lineWidth, 0xffffff, 0.1);
    relationshipLine.moveTo(0, 0);
    containerBox.addChild(relationshipLine);

    circle = new PIXI.Graphics();
    circle.beginFill(0x3355ff);
    circle.drawCircle(0, 0, planetsize);
    circle.endFill();
    circle.x = renderer.width/2;
    circle.y = renderer.height/2;
    circle.speedx = 0;
    circle.speedy = -0.4;
    circle.mass = 50;
    containerBox.addChild(circle);

    second = new PIXI.Graphics();
    second.beginFill(0x99ff99);
    second.drawCircle(0, 0, shipsize);
    second.endFill();
    second.x = renderer.width/2 - 100;
    second.y = renderer.height/2;
    second.speedx = startX;
    second.speedy = startY;
    second.mass = 50;
    containerBox.addChild(second);


    stage.addChild(containerBox);
    containerBox.scale.x = containerBox.scale.y = zoom;
    containerBox.x = renderer.width/2;
    containerBox.y = renderer.height/2;
    containerBox.pivot.x = renderer.width/2;
    containerBox.pivot.y = renderer.height/2;
    containerBox.scale.y = containerBox.scale.x = zoom;

    $(".btn1").on("click touchstart", function() {
        trail.clear();
        trail2.clear();
        trail2.lineStyle(lineWidth, 0xff9999, 0.4);
    });
    setTimeout( logic, simspeed );

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
        second.speedx -= thrust;
    }
    // D
    if (keys[3]) {
        second.speedx += thrust;
    }
    // W
    if (keys[0]) {
        second.speedy -= thrust;
    }
    // S
    if (keys[2]) {
        second.speedy += thrust;
    }

    // trail
    if(counter % 2 === 0) {
        trail.lineStyle(lineWidth, lineColor, 0.2);
    }
    else {
        trail.lineStyle(lineWidth, lineColor, 0.1);
    }



    // Orbital "Dynamics"
    var diffX = circle.x - second.x;
    var diffY = circle.y - second.y;


    // calculate distance between circles
    var r = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

    // Prevent it from flying into infinity
    r = Math.max(r / 10, 1.5);

    // calculate angle
    var anglex = Math.atan((diffX)/Math.abs(diffY));
    var angley = Math.atan(diffY/Math.abs(diffX));

    // speed of "second" planet
    var speed = Math.round(Math.sqrt(Math.pow(second.speedx, 2) + Math.pow(second.speedy, 2)) * 100)/100;
    // change speed


    // change acceleration
    second.speedx += Math.sin(anglex)*gravity*circle.mass/Math.max(Math.pow(r, 2), 1);
    second.speedy += Math.sin(angley)*gravity*circle.mass/Math.max(Math.pow(r, 2), 1);

    // velocity angle/vector
    var velAnglex = Math.atan(second.speedx/Math.abs(second.speedy));
    // var veltest0 = Math.sin(velAnglex) * thrust;
    // var veltest1 = thrust * second.speedx/(Math.abs(second.speedx) + Math.abs(second.speedy));
    var velAngley = Math.atan(second.speedy/Math.abs(second.speedx));


    // "earth" acceleration
    diffX = second.x - circle.x;
    diffY = second.y - circle.y;

    // calculate angle
    anglex = Math.atan((diffX)/Math.abs(diffY));
    angley = Math.atan(diffY/Math.abs(diffX));

    circle.speedx += Math.sin(anglex)*gravity*second.mass/Math.max(Math.pow(r, 2), 1);
    circle.speedy += Math.sin(angley)*gravity*second.mass/Math.max(Math.pow(r, 2), 1);

    // prograde/retrograde

    if(fuel >= 0) {
        if(grade[0]) {
            second.speedx += Math.sin(velAnglex) * thrust;
            second.speedy += Math.sin(velAngley) * thrust;
            fuel -= thrust;
        }
        else if(grade[1]) {
            second.speedx -= Math.sin(velAnglex) * thrust;
            second.speedy -= Math.sin(velAngley) * thrust;
            fuel -= thrust;
        }

        if(grade[0] || keys[0] || keys[1] || keys[2] || keys[3]) {
            trail.lineStyle(lineWidth, proColor, 0.4);
        }
        else if(grade[1]) {
            trail.lineStyle(lineWidth, retroColor, 0.4);
        }
    }

    if(changeThrust.decrease && thrust > 0) {
        thrust -= changeAmount;
    }

    if(changeThrust.increase) {
        thrust += changeAmount
    }

    $(".display").html("speed: " + speed + "<br> Fuel:" + (Math.round(fuel*10)) + "<br> Thrust:" + (Math.round(thrust*1000) / 10) + "<br>R: " + Math.round(r));

    $("#fuelamount").css("width", (fuel/startFuel*100) + "%")

    // draw trail
    trail.moveTo(second.x,second.y);
    trail2.moveTo(circle.x,circle.y);

    // move objects
    circle.x += circle.speedx;
    circle.y += circle.speedy;
    second.x += second.speedx;
    second.y += second.speedy;



    if (counter % 20 == 0) {
        background.x = -window.innerWidth * 5 + Math.round(second.x/bgHeight) * bgHeight;
        background.y = -window.innerHeight * 5 + Math.round(second.y/bgHeight) * bgHeight;
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

    // second.speedx *= 0.9999;
    // second.speedy *= 0.9999;

    // fake drag:
    if (r < 0) {
        var drag = 1 - (0.005/Math.pow(r + 3, 2) * speed);
        second.speedx *= drag;
        second.speedy *= drag;
    }

    if(follow) {
        containerBox.x = (-second.x + renderer.width*zoomNum)*zoom;
        containerBox.y = (-second.y + renderer.height*zoomNum)*zoom;
        // thingBox.scale.x = thingBox.scale.y = 1 - (speed*0.01);
    }


    // new trail segment
    trail.lineTo(second.x , second.y);
    trail2.lineTo(circle.x, circle.y);

    // relation between objects
    relationshipLine.clear();
    relationshipLine.lineStyle(Math.min(Math.max(100/r, 1), 10), 0xffffff, Math.max(Math.min(3/r, 0.9), 0.05));

    relationshipLine.moveTo(second.x, second.y);

    relationshipLine.lineTo(circle.x, circle.y);

    // detect collision

    if (r < 0){
        second.speedx = 0;
        second.speedy = 2;
        second.x -= 200;
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
