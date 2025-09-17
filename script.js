const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddleLengthInput = document.getElementById('paddleLength');
const paddleLengthValue = document.getElementById('paddleLengthValue');
const ballSizeInput = document.getElementById('ballSize');
const ballSizeValue = document.getElementById('ballSizeValue');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

const paddleHeight = 14;
let paddleWidth = Number(paddleLengthInput.value);
let paddleX = (canvas.width - paddleWidth) / 2;

let ballRadius = Number(ballSizeInput.value);
let x = canvas.width / 2;
let y = canvas.height - paddleHeight - ballRadius - 4;
let dx = 3;
let dy = -3;

let rightPressed = false;
let leftPressed = false;

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 64;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 50;
const totalBrickWidth =
  brickColumnCount * brickWidth + (brickColumnCount - 1) * brickPadding;
const brickOffsetLeft = (canvas.width - totalBrickWidth) / 2;

let score = 0;
let lives = 3;
let bricks = [];

function initBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c += 1) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r += 1) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height - paddleHeight - ballRadius - 4;
  const speed = 3.2;
  dx = speed * (Math.random() > 0.5 ? 1 : -1);
  dy = -speed;
}

function updateScoreboard() {
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#4fa2ff';
  ctx.shadowColor = '#8cc8ff';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddleX, canvas.height - paddleHeight - 6, paddleWidth, paddleHeight, 6);
  ctx.fillStyle = '#ffb347';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c += 1) {
    for (let r = 0; r < brickRowCount; r += 1) {
      if (bricks[c][r].status === 1) {
        const brickX = brickOffsetLeft + c * (brickWidth + brickPadding);
        const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 8);
        const gradient = ctx.createLinearGradient(
          brickX,
          brickY,
          brickX,
          brickY + brickHeight
        );
        gradient.addColorStop(0, '#58d68d');
        gradient.addColorStop(1, '#2ecc71');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c += 1) {
    for (let r = 0; r < brickRowCount; r += 1) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x - ballRadius &&
          x < b.x + brickWidth + ballRadius &&
          y > b.y - ballRadius &&
          y < b.y + brickHeight + ballRadius
        ) {
          dy = -dy;
          b.status = 0;
          score += 1;
          updateScoreboard();
          if (score === brickRowCount * brickColumnCount) {
            initBricks();
            score = 0;
            lives += 1;
            updateScoreboard();
            resetBall();
          }
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (
    y + dy >
    canvas.height - paddleHeight - 6 - ballRadius
  ) {
    if (x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius) {
      const hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
      const speed = Math.sqrt(dx * dx + dy * dy);
      const angle = hitPoint * (Math.PI / 3);
      dx = speed * Math.sin(angle);
      dy = -Math.abs(speed * Math.cos(angle));
      y = canvas.height - paddleHeight - 6 - ballRadius - 1;
    } else if (y + dy > canvas.height - ballRadius) {
      lives -= 1;
      updateScoreboard();
      if (!lives) {
        initBricks();
        score = 0;
        lives = 3;
      }
      resetBall();
    }
  }

  if (rightPressed) {
    paddleX += 6;
  } else if (leftPressed) {
    paddleX -= 6;
  }

  if (paddleX < 0) {
    paddleX = 0;
  } else if (paddleX + paddleWidth > canvas.width) {
    paddleX = canvas.width - paddleWidth;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Right' || event.key === 'ArrowRight') {
    rightPressed = true;
  } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
    leftPressed = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Right' || event.key === 'ArrowRight') {
    rightPressed = false;
  } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
    leftPressed = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeX = event.clientX - rect.left;
  paddleX = relativeX - paddleWidth / 2;
  if (paddleX < 0) {
    paddleX = 0;
  } else if (paddleX + paddleWidth > canvas.width) {
    paddleX = canvas.width - paddleWidth;
  }
});

canvas.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  const relativeX = touch.clientX - rect.left;
  paddleX = relativeX - paddleWidth / 2;
  if (paddleX < 0) {
    paddleX = 0;
  } else if (paddleX + paddleWidth > canvas.width) {
    paddleX = canvas.width - paddleWidth;
  }
  event.preventDefault();
});

paddleLengthInput.addEventListener('input', () => {
  paddleWidth = Number(paddleLengthInput.value);
  if (paddleX + paddleWidth > canvas.width) {
    paddleX = canvas.width - paddleWidth;
  }
  if (paddleX < 0) {
    paddleX = 0;
  }
  paddleLengthValue.textContent = paddleWidth;
});

ballSizeInput.addEventListener('input', () => {
  ballRadius = Number(ballSizeInput.value);
  ballSizeValue.textContent = ballRadius;
  if (y > canvas.height - paddleHeight - ballRadius - 6) {
    y = canvas.height - paddleHeight - ballRadius - 6;
  }
});

initBricks();
updateScoreboard();
draw();
