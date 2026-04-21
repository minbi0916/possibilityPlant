'use strict';

var joinedText = "";
var charSet;
var counters = [];

var posX;
var posY;

var tracking = 29;
var actRandomSeed = 0;

var drawAlpha = true;
var drawLines = true;
var drawEllipses = true;
var drawText = false;
var followText = false;
var drawFlower = false;


let input;

function setup() {
  createCanvas(1400, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  textFont('monospace', 20);
  noStroke();

  input = createInput("오늘의 가능성이 씨앗이 되어 무럭무럭 자랍니다.");
  input.position(width / 2 - 150, 20);
  input.size(300);

  updateText();
  input.input(updateText);
}

function updateText() {
  joinedText = input.value();

  charSet = getUniqCharacters();

  counters = [];
  for (var i = 0; i < charSet.length; i++) {
    counters[i] = 0;
  }

  countCharacters();
}

function draw() {
  background(360);

  // 🔥 중심 고정
  posX = width / 2;
  posY = height / 2;

  randomSeed(actRandomSeed);

  let tLimit = map(mouseY, 0, height, 1, 0);
  tLimit = constrain(tLimit, 0, 1);


  for (var i = 0; i < joinedText.length; i++) {

    var upperCaseChar = joinedText.charAt(i).toUpperCase();
    var index = charSet.indexOf(upperCaseChar);
    if (index < 0) continue;

    var charAlpha = 100;
    if (drawAlpha) {
      charAlpha = counters[index];
    }

    // var my = map(mouseY, 5, height - 50, 0, 1); //값 최소1 최대1 최소2 최대2
    // my = constrain(my, 0, 1);
    // var charSize = counters[index] * my * 3;
    let charSize = counters[index] * 2;

    // var mx = map(mouseX, 5, width - 50, 0, 1);
    // mx = constrain(mx, 0, 1);

    // var lineLength = charSize;
    // var lineAngle = random(-PI, PI) * mx - HALF_PI;

    // let spreadAngle = PI * 0.8; 
    let baseAngle = -HALF_PI;

    let tIndex = i / joinedText.length;

    let angleNoise = map(noise(i * 0.2), 0, 1, -PI * 3, PI * 3);
    // let lineAngle = angleNoise;
    let lineAngle = noise(i * 0.2) * PI * 4;

    // 퍼짐 정도
    // var spread = 15;

    // var newPosX = lineLength * cos(lineAngle) * spread;
    // var newPosY = lineLength * sin(lineAngle) * spread;

    // var newPosX = 20 * cos(lineAngle) * spread;
    // var newPosY = 14 * sin(lineAngle) * spread;

    let length = map(noise(i * 0.2), 0, 1, 50, 400); // 값, 최소1 최대1 최소2 최대2

    let scaleX = 2;   // 가로 늘리기
    let scaleY = 0.5; // 세로 줄이기

    let newPosX = length * cos(lineAngle) * scaleX;
    let newPosY = length * sin(lineAngle) * scaleY;

    push();
    translate(posX, posY);

     let x1 = random(-50, 50);
    let y1 = 300;
    let centerX = mouseX/8;
    let centerY = -150;

    let x2 = lerp(centerX, newPosX, 0.3);
    let y2 = lerp(centerY, newPosY, 0.3);

    let x3 = lerp(centerX, newPosX, 0.7);
    let y3 = lerp(centerY, newPosY, 0.7);

    // 자연스러운 노이즈
    x2 += random(-5, 5);
    y2 += random(-5, 5);

    x3 += random(-10, 10);
    y3 += random(-10, 10);


    let x4 = newPosX + mouseX / 8;
    let y4 = newPosY;

    let t = map(mouseX, 0, width, 0, 1);
    t = constrain(t, 0, 1);
    // let angleControl = mx;

    let x = bezierPoint(x1, x2, x3, x4, t);
    let y = bezierPoint(y1, y2, y3, y4, t);

    stroke(120, 60, 40, charAlpha * 20);
    strokeWeight(2);
    if (drawLines) {

      noFill();
      beginShape();

      for (let t = 0; t <= tLimit; t += 0.05) {
        let bx = bezierPoint(x1, x2, x3, x4, t);
        let by = bezierPoint(y1, y2, y3, y4, t);
        vertex(bx, by);
      }

  endShape();


      // bezier(x1, y1, x2, y2, x3, y3, x4, y4);
      // line(random(-50, 50), 0, newPosX, newPosY);
    }

    noStroke();
    fill(90, 80, 90, charAlpha * 5);
    if (drawEllipses) {
      ellipse(newPosX, newPosY, charSize * 5, charSize * 5);
    }

    if (drawFlower) {
      push();

      translate(newPosX, newPosY); // 🌼 꽃 중심으로 이동

      for (let j = 0; j < 8; j++) { // 꽃잎 개수
        fill(45, 3, 98, charAlpha * 100);
        ellipse(0, charSize * 2, charSize * 2, charSize * 4); 
        rotate(TWO_PI / 8); // 균등 회전
      }

      // 가운데
      fill(48, 85, 100, charAlpha * 100);
      ellipse(0, 0, charSize * 2, charSize * 2);

      pop();
    }

    if (drawText) {

  if (followText) {
    // 🌱 성장 따라가는 텍스트
    let tCurrent = tLimit;

    let tx = bezierPoint(x1, x2, x3, x4, tCurrent);
    let ty = bezierPoint(y1, y2, y3, y4, tCurrent);

    fill(0);
    text(joinedText.charAt(i), tx, ty);

  } else {
    // 기존 방식
    fill(0, random(charAlpha, charAlpha * 100));
    text(joinedText.charAt(i), newPosX, newPosY);
  }
}

    pop();
  }
}


function getUniqCharacters() {
  var charsArray = joinedText.toUpperCase().split('');
  var uniqCharsArray = charsArray.filter(function(char, index) {
    return charsArray.indexOf(char) == index;
  }).sort();
  return uniqCharsArray.join('');
}

function countCharacters() {
  for (var i = 0; i < joinedText.length; i++) {
    var index = charSet.indexOf(joinedText.charAt(i).toUpperCase());
    if (index >= 0) counters[index]++;
  }
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas('myCanvas', 'png');

  if (key == '1') drawAlpha = !drawAlpha;
  if (key == '2') drawLines = !drawLines;
  if (key == '3') drawEllipses = !drawEllipses;
  if (key == '4') drawText = !drawText;
  if (key == '5') followText = !followText;
  if (key == '6') drawFlower = !drawFlower;
}

let infoVisible = false;

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("help-btn");
  const box = document.getElementById("info-box");

  btn.addEventListener("click", () => {
    infoVisible = !infoVisible;
    box.style.display = infoVisible ? "block" : "none";
  });
});