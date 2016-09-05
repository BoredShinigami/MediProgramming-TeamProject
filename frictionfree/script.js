var playing, rendering, stopGame, ctx, circle, pressed, MAP_DATA, timer, music, difficulty;
const START_X = 200, START_Y = 190, BEST_AMOUNT = 10;
const IMG_COLORS = [[0x00, 0x00, 0x00, 0xFF], [0xFF, 0x33, 0x33, 0xFF], [0xFF, 0xFF, 0xFF, 0xFF]];
const MAP_COLORS = [[0x6A, 0x88, 0x91, 0xFF], [0xFF, 0xFF, 0xFF, 0xFF], [0x228, 0x217, 0x217, 0x00]];
//                 [[red, green, blue, alpha], [red, green, blue, alpha], [0x00, 0x00, 0x00, 0x00]];
//                 [[TRACK EDGES RBGA VALUES],[FINISH LINE RGBA VALUES],[TRANSPARENT BLACK RGBA]];
const ACC = [0.015, 0.030, 0.055];

// called by onclick attribute of html link buttons. the parameter sets the difficoulty level
function startGame(level){
    timer = new function(){
        this.time = 0;
        this.loopID = -1;
        this.display = function(){
            var string = ("Elapsed Time: " + timer.format());
            if(document.getElementById("timeDiv") != null)
                document.getElementById("timeDiv").innerHTML = string;
            return string;
        };
        this.format = function(t){
            var time = typeof t == "undefined" ? timer.time : t;
            var mil = time % 100;
            var min = parseInt(time / (60 * 100));
            var sec =  parseInt(time / 100) % 60;
            return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec) + "." + (mil < 10 ? "0" + mil : mil);
        };
        this.reset = function(){
            timer.time = 0;
            timer.display();
        };
        this.start = function(){
            if(this.loopID == -1){
                timer.time = 0;
                this.loop();
                timer.loopID = setInterval(this.loop, 10);
            }
        };
        this.stop = function(){ 
            if(timer.loopID != -1) {
                clearInterval(timer.loopID);
                timer.loopID = -1;
            }
        };
        this.loop = function(){
            timer.display();
            timer.time++;
        };
        this.running = function(){
            return timer.loopID != -1;
        };
    };
    playing = true, rendering = true, stopGame = false, difficulty = level;
    circle = {x: START_X, y: START_Y, dx: 0, dy: 0, acc: ACC[level], r: 10, color: "#d3d3d3", toStart: function(){this.x = START_X; this.y = START_Y; this.dx = 0; this.dy = 0; music.currentTime = 0; timer.reset(); timer.stop();}};

    createAndAppend("div", {id: "timeDiv", innerHTML: timer.display()}, "main");
    removeEl("preStart");
    pressed = Array(4);
    for(var i = 0; i < pressed.length; i++)
        pressed[i] = false;
    var mapImg = new Image();
    mapImg.onload = function() {
        MAP_DATA = getMap(mapImg);
        ctx = createAndAppend("canvas", {width: mapImg.width, height: mapImg.height, id: "gameCanvas"}, "main").getContext("2d");
        displayResults();
        gameLoop(0);
    };
    mapImg.src = "res/map.gif";
    window.addEventListener('keydown', doKeyDown, true);
    window.addEventListener('keyup', doKeyUp, true);
    music = new Audio('res/music.mp3');
    music.addEventListener("ended", function() {this.currentTime = 0; this.play();}, false);
    music.play();
}

// places the circle on the canvas, based on its position set by x and y variables
function drawCircle(){
    ctx.beginPath();
    ctx.fillStyle = circle.color;
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);
    ctx.fill();
}

// returns the color which touches the edge of the circle. priority is defined as the order in the array of MAP_COLOR
function checkCollision(){
    var mapRGBA = MAP_DATA.data;
    for(var x = circle.x-circle.r; x < circle.x+circle.r; x+=circle.r/3){
        var y1 = Math.round(Math.sqrt((circle.x-x)*(circle.x-x)+(circle.r*circle.r))+circle.y);
        var y2 = Math.round(-Math.sqrt((circle.x-x)*(circle.x-x)+(circle.r*circle.r))+circle.y);
        var index = [(y1*MAP_DATA.width+Math.round(x))*4, (y2*MAP_DATA.width+Math.round(x))*4];
        for(var i = 0; i < (MAP_COLORS.length - 1); i++)
            for (var k = 0; k < index.length; k++) {
                var expr = true;
                for (var j = 0; j < MAP_COLORS[i].length; j++)
                    expr = expr && (equals(mapRGBA[index[k] + j], MAP_COLORS[i][j], 0));
                if (expr)
                    return i;
            }
    }
    return (MAP_COLORS.length - 1);
}

// returns modified pixel data of the map. this data is used to draw track on screen
function getMap(mapImg){
    var mapCanvas = document.createElement("canvas");
    mapCanvas.width = mapImg.width;
    mapCanvas.height = mapImg.height;
    var mapCtx = mapCanvas.getContext("2d");
    mapCtx.drawImage(mapImg, 0, 0);
    var mapData = mapCtx.getImageData(0,0,mapCanvas.width,mapCanvas.height);
    var mapRGBA = mapData.data;
    for(var i = 0; i < mapRGBA.length; i+=4) {
        var drawn = false;
        for (var j = 0; j < IMG_COLORS.length; j++)
            if (equals(mapRGBA[i], IMG_COLORS[j][0]) && equals(mapRGBA[i + 1], IMG_COLORS[j][1]) && equals(mapRGBA[i + 2], IMG_COLORS[j][2]) && equals(mapRGBA[i + 3], IMG_COLORS[j][3])) {
                for (var k = 0; k < IMG_COLORS[j].length; k++)
                    mapRGBA[i + k] = MAP_COLORS[j][k];
                drawn = true;
                break;
            }
        if (!drawn)
            for (var k = 0; k < IMG_COLORS[2].length; k++)
                mapRGBA[i + k] = MAP_COLORS[2][k];
    }
    return mapData;
}

// called by event listener when a key is pressed. allows for smoother user input
function doKeyDown(evt) {
    switch (evt.keyCode) {
        case 38: //up arrow
            pressed[0] = true;
            break;
        case 40: //down arrow
            pressed[1] = true;
            break;
        case 37: //left arrow
            pressed[2] = true;
            break;
        case 39: //right arrow
            pressed[3] = true;
            break;
    }
    if(!timer.running())
        for(var i = 0; i < pressed.length; i++)
            if(pressed[i])
                timer.start();
}

// called by event listener when a key press is released
function doKeyUp(evt) {
    switch (evt.keyCode) {
        case 38: //up arrow
            pressed[0] = false;
            break;
        case 40: //down arrow
            pressed[1] = false;
            break;
        case 37: //left arrow
            pressed[2] = false;
        case 39: //right arrow
            pressed[3] = false;
            break;
    }
}

// used to compare two values. delta paramenter can be set to add a margin of acceptable error
function equals(a, b, delta){
    delta = typeof delta == "undefined" ? 0x20 : delta;
    if(Math.abs(a-b) <= delta)
        return true;
    return false;
}

// main game loop. controls frame rate and calculation (tick) rate
function gameLoop(time){
    if(time % 2 == 0 && rendering)
        render();
    if(time % 1 == 0 && playing)
        tick();
    if(!stopGame)
        setTimeout(function(){gameLoop(time+1);}, 8);
}

// redraws the pixels on main ('gameCanvas') canvas.
function render(){
    ctx.putImageData(MAP_DATA,0,0);
    drawCircle();
}

// game calculations are done with every 'tick'. unit of time for the game. All of game's physics and logic happens here
function tick(){
    if(pressed[0])
        circle.dy -= circle.acc;
    if(pressed[1])
        circle.dy += circle.acc;
    if(pressed[2])
        circle.dx -= circle.acc;
    if(pressed[3])
        circle.dx += circle.acc;
    circle.y += circle.dy;
    circle.x += circle.dx;
    switch(checkCollision()){
        case 0:
            circle.toStart();
            break;
        case 1:
            if(circle.dy > 0) {
                circle.y -= (circle.dy+2);
                circle.dy = 0;
            }
            if(circle.dy < 0) {
                timer.display();
                saveResult(timer.time);
                alert("Your time was " + timer.format());
                for(var i = 0; i < pressed.length; i++)
                    pressed[i] = false;
                circle.toStart();
            }
            break;
        case 2:
    }
}

// reads saved best times from cookies, and returns them as a sorted array
function getSavedResults(){
    var res = [];
    for(var i = 0; i < BEST_AMOUNT; i++)
        if(getCookie("best" + difficulty + "|" + i) != "")
            res.push(parseInt(getCookie("best" + difficulty + "|" + i)));
    return res;
}

// saves the parameter time in the cookies, in the right (sorted) place 
function saveResult(time){
    var res = getSavedResults();
    for(var i = 0; i < res.length; i++)
            if(time < res[i]){
                res.splice(i, 0, time);
                break;
            }
    if(res.indexOf(time) == -1)
        res.push(time);
    for(var i = 0; i < (res.length > 10 ? 10 : res.length); i++)
        setCookie("best" + difficulty + "|" + i, res[i]);
    displayResults();
}

// dynamically creates html, which is then used to display the saved best times
function displayResults(){
    var res = getSavedResults();
    createAndAppend("div", {id: "bestResults", innerHTML: "Your Personal Best: <br>"}, "main");
    createAndAppend("ol", {id: "bestList"}, "bestResults");
    for(var i = 0; i < res.length; i++){
        createAndAppend("li", {id: "best" + i, innerHTML: timer.format(res[i])}, "bestList");
    }
}


// general function used to create html elements with attributtes, and then append them to a parent, specified by its id
function createAndAppend(el, attr, parentID){
    if("id" in attr)
        removeEl(attr.id);
    var parent = document.getElementById(parentID);
    var element = document.createElement(el);
    for(var k in attr)
        element[k] = attr[k];
    parent.appendChild(element);
    return element;
}

// removes a html element (and its children) from the document
function removeEl(elID){
    if(document.getElementById(elID) != null)
        document.getElementById(elID).parentNode.removeChild(document.getElementById(elID));
}

// saves a cookie key-value pair
function setCookie(name, value) {
    document.cookie = name + "=" + value;
}

// retrives the value of a cookie key-value pair
function getCookie(name) {
    var cookie = document.cookie.split("; ");
    for(var i = 0; i < cookie.length; i++) {
        var pair = cookie[i].split("=");
        if(pair[0] == name)
            return pair[1];
    }
    return "";
}