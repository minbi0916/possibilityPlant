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

let started = false;


let input;
let textA, textB;

let letters = [];
let animating = false;

let resultText;

let rootX, rootY;

let showPreview = false;
let previewStartTime = 0;
let previewDuration = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);


  input = select('#myInput'); // 🔥 핵심
  updateText();
  input.input(updateText);

  textA = select('.a');
  textB = select('.b');

  resultText = select('#resultText');
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

  posX = width / 2;
  posY = height / 2;

  if (!started) {
    drawStartScreen();
  } else {
    drawPlayScreen();
  }


  push();
    translate(posX, posY);
    animateLetters();
  pop();
  
}

function drawStartScreen() {
}


function drawPlayScreen() {

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

    let charSize = counters[index] * 2;

    let baseAngle = -HALF_PI;

    let tIndex = i / joinedText.length;

    let angleNoise = map(noise(i * 0.2), 0, 1, -PI * 3, PI * 3);
    let lineAngle = noise(i * 0.2) * PI * 4;


    let length = map(noise(i * 0.2), 0, 1, 50, 400); // 값, 최소1 최대1 최소2 최대2

    let scaleX = 2;   // 가로 늘리기
    let scaleY = 0.5; // 세로 줄이기

    let newPosX = length * cos(lineAngle) * scaleX;
    let newPosY = length * sin(lineAngle) * scaleY;

    push();
    translate(posX, posY);


    let x1 = rootX;
    let y1 = rootY;

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
    if (started && drawLines) {

      noFill();
      beginShape();

      for (let t = 0; t <= tLimit; t += 0.05) {
        let bx = bezierPoint(x1, x2, x3, x4, t);
        let by = bezierPoint(y1, y2, y3, y4, t);
        vertex(bx, by);
      }

  endShape();

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
    
    if (started && drawText) {

      if (followText) {
        let tCurrent = tLimit;

        let tx = bezierPoint(x1, x2, x3, x4, tCurrent);
        let ty = bezierPoint(y1, y2, y3, y4, tCurrent);

        fill(0);
        text(joinedText.charAt(i), tx, ty);

      } else {
        fill(0, random(charAlpha, charAlpha * 100));
        text(joinedText.charAt(i), newPosX, newPosY);
      }

    }

    pop();
  }
}

function createLetters() {
  letters = [];

  let rect = input.elt.getBoundingClientRect();

  let startX = rect.left;
  let startY = rect.top;

  let lineHeight = 30;   // 줄 간격
  let charWidth = 14;    // 글자 간격

  for (let i = 0; i < joinedText.length; i++) {
    let ch = joinedText.charAt(i);

    // 줄바꿈 처리
    let col = i % 20;
    let row = floor(i / 20);

    letters.push({
      char: ch,

      // ✅ 진짜 textarea 위치 기반
      x: startX + col * charWidth,
      y: startY + row * lineHeight,

      targetX: rootX,
      targetY: rootY,

      size: 300,        // textarea랑 비슷하게 시작
      targetSize: 40,

      delay: i * 20,
      absorbed: false,
      alpha: 255
    });
  }
}

function animateLetters() {
  for (let l of letters) {

    let d = dist(l.x, l.y, l.targetX, l.targetY);

    // 🔥 가까워지면 흡수 시작
    if (d < 20) {
      l.absorbed = true;
    }

    if (!l.absorbed) {
      if (frameCount > l.delay) {
        l.x = lerp(l.x, l.targetX, 0.08);
        l.y = lerp(l.y, l.targetY, 0.08);
        l.size = lerp(l.size, l.targetSize, 0.08);
      }
    } else {
      // 🌱 흡수 연출
      l.alpha -= 10;        // 사라짐
      l.size *= 0.9;        // 쪼그라듦
    }

    if (l.alpha > 0) {
      fill(30, 80, 40, l.alpha);
      noStroke();
      textSize(l.size);
      text(l.char, l.x, l.y);
    }
  }

  let allGone = true;

    for (let l of letters) {
      if (l.alpha > 0) {
        allGone = false;
      }
    }

    if (allGone) {
      animating = false;
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

function keyPressed() {
  if (keyCode === ENTER) {
    started = true;
    updateText(); // 마지막 입력 확정

    textA.addClass('fade');
    textB.addClass('fade');

    resultText.html(joinedText); // 텍스트 복사
    resultText.style('opacity', '1');

    input.attribute('disabled', true);

    rootX = random(-50, 50);
    rootY = 300;

    createLetters();   // 🔥 핵심
    animating = true;

    input.style('opacity', '0');
  }
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