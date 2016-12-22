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

// "settings"
var planetsize = 30,
    shipsize = 9,
    gravity = 20,
    follow = true,
    startX = 0,
    startY = 4,
    thrust = 0.01,
    simspeed = 1000 / 60,
    zoom = 1,
    lineColor = 0x66bbff,
    retroColor = 0xff4444,
    proColor = 0x44ff44,
    startFuel = 90,
    lineWidth = 2,
    changeAmount = 0.0005;


// amount of fuel left
var fuel = startFuel;



function changeOffset(key, setting) {
    // A
    //if(key == 65){
    //    keys[1] = setting;
        // offsetx -= 3;
    //}
    // D
    //if (key == 68) {
    //    keys[3] = setting;
        // offsetx += 3;
    //}
    // W
    //if (key == 87) {
    //    keys[0] = setting;
        // offsety -= 3;
    //}
    // S
    //if (key == 83) {
    //    keys[2] = setting;
        // offsety += 3;
    //}
    // Z
    if (key == 90) {
        grade[0] = setting;
    }
    // X
    if (key == 88) {
        grade[1] = setting;
    }

    if (key == 17) {
        changeThrust.decrease = setting;
    }
    if (key == 16) {
        changeThrust.increase = setting
    }

}


// control
document.addEventListener('keydown', function(ev) {changeOffset(ev.keyCode, true);  }, false);
document.addEventListener('keyup', function(ev) {changeOffset(ev.keyCode, false);}, false);
// load after page is done
$(document).ready(function() {
    setTimeout(removeOverlay, 2000)
    document.getElementById('prograde').addEventListener("touchstart", function() {changeOffset(90, true);});
    document.getElementById('prograde').addEventListener("touchend", function() {changeOffset(90, false);});
    document.getElementById('retrograde').addEventListener("touchstart", function() {changeOffset(88, true);});
    document.getElementById('retrograde').addEventListener("touchend", function() {changeOffset(88, false);});
    // PIXI variables
    var Container = PIXI.Container,
        autoDetectRenderer = PIXI.autoDetectRenderer,
        // loader = PIXI.loader,
        // resources = PIXI.loader.resources,
        // TextureCache = PIXI.utils.TextureCache,
        // Texture = PIXI.texture,
        // Sprite = PIXI.Sprite,
        Graphics = PIXI.Graphics;

    // Pixi container.
    stage = new Container();
    renderer = new autoDetectRenderer(1000, 500, {antialias: true});
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize(window.innerWidth, window.innerHeight);
    renderer.backgroundColor = 0x24232f;
    document.body.appendChild(renderer.view);


    var circle;
    var second;
    // var line;
    var trail;
    var counter = 0;
    var thingBox;
    setup();

    function setup() {

        thingBox = new PIXI.Container();

        // create a trail
        trail = new PIXI.Graphics();
        trail.lineStyle(5, 0xffffff);
        trail.moveTo(startX, startY);
        thingBox.addChild(trail);

        circle = new Graphics();
        circle.beginFill(0x3355ff);
        circle.drawCircle(0, 0, planetsize);
        circle.endFill();
        circle.x = renderer.width/2;
        circle.y = renderer.height/2;
        circle.speedx = 0;
        circle.speedy = 0;
        thingBox.addChild(circle);

        second = new Graphics();
        second.beginFill(0x99ff99);
        second.drawCircle(0, 0, shipsize);
        second.endFill();
        second.x = renderer.width/2 - 100;
        second.y = renderer.height/2;
        second.speedx = startX;
        second.speedy = startY;
        thingBox.addChild(second);


        stage.addChild(thingBox);
        thingBox.scale.x = thingBox.scale.y = zoom;
        thingBox.x = renderer.width/2;
        thingBox.y = renderer.height/2;
        thingBox.pivot.x = renderer.width/2;
        thingBox.pivot.y = renderer.height/2;
        thingBox.scale.y = thingBox.scale.x = zoom;

        $(".btn1").on("click touchstart", function() {
            trail.clear();
        });
        setTimeout( logic, simspeed );

        render();
    }

    function render() {
        logic()

        renderer.render(stage);

        requestAnimationFrame(render);
    }

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
        r = r / 10;

        // calculate angle
        var anglex = Math.atan((diffX)/Math.abs(diffY));
        var angley = Math.atan(diffY/Math.abs(diffX));

        // speed of "second" planet
        var speed = Math.round(Math.sqrt(Math.pow(second.speedx, 2) + Math.pow(second.speedy, 2)) * 100)/100;
        // change speed


        // change acceleration
        second.speedx += Math.sin(anglex)*gravity/Math.max(Math.pow(r, 2), 1);
        second.speedy += Math.sin(angley)*gravity/Math.max(Math.pow(r, 2), 1);

        // velocity angle/vector
        var velAnglex = Math.atan(second.speedx/Math.abs(second.speedy));
        // var veltest0 = Math.sin(velAnglex) * thrust;
        // var veltest1 = thrust * second.speedx/(Math.abs(second.speedx) + Math.abs(second.speedy));
        var velAngley = Math.atan(second.speedy/Math.abs(second.speedx));

        // prograde/retrograde

        if(fuel >= 0) {
            if(grade[0]) {
                second.speedx += Math.sin(velAnglex) * thrust;
                second.speedy += Math.sin(velAngley) * thrust;
                fuel -= thrust;
            }
            if(grade[1]) {
                second.speedx -= Math.sin(velAnglex) * thrust;
                second.speedy -= Math.sin(velAngley) * thrust;
                fuel -= thrust;
            }

            if(grade[0]) {
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

        $(".display").html("speed: " + speed + "<br> Fuel:" + (Math.round(fuel*10)) + "<br> Thrust:" + (Math.round(thrust*1000) / 10));

        $("#fuelamount").css("width", (fuel/startFuel*100) + "%")

        // draw trail
        trail.moveTo(second.x,second.y);

        // move objects
        circle.x += circle.speedx;
        circle.y += circle.speedy;
        second.x += second.speedx;
        second.y += second.speedy;

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
            thingBox.x = -second.x + renderer.width;
            thingBox.y = -second.y + renderer.height;
            // thingBox.scale.x = thingBox.scale.y = 1 - (speed*0.01);
        }


        // new trail segment
        trail.lineTo(second.x , second.y);

        // detect collision

        if (r < 2){
            second.speedx = 0;
            second.speedy = 2;
            second.x -= 200;
        }
        counter += 1;
        // setTimeout( logic, simspeed );

    }



});

function removeOverlay() {
    $("#prograde").html("");
    $("#prograde").css("background-color", "rgba(0, 0, 0, 0)");
    $("#retrograde").html("");
    $("#retrograde").css("background-color", "rgba(0, 0, 0, 0)");
}
