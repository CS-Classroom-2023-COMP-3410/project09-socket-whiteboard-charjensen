import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Get canvas and context
const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');

// Global array to store all drawing actions
let localBoardState = [];

// Resize the canvas to fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Clear the entire canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Redraw all stored drawing actions from localBoardState
function redraw() {
  clearCanvas();
  localBoardState.forEach(drawLine);
}

// Initial canvas resize
resizeCanvas();

// Re-draw the board whenever the window is resized
window.addEventListener('resize', () => {
  resizeCanvas();
  redraw();
});

// Current drawing state
let drawing = false;
let current = { color: document.getElementById('colorPicker').value };

// Update current color when the user selects a new one
document.getElementById('colorPicker').addEventListener('input', (e) => {
  current.color = e.target.value;
});

// Start drawing on mousedown
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current.x = e.clientX;
  current.y = e.clientY;
});

// Stop drawing on mouseup
canvas.addEventListener('mouseup', () => {
  drawing = false;
});

// On mouse move, if drawing, emit the drawing action to the server
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  
  const data = {
    x0: current.x,
    y0: current.y,
    x1: e.clientX,
    y1: e.clientY,
    color: current.color
  };
  
  // Emit the drawing event to the server
  socket.emit('draw', data);
  
  // Update current position for the next segment
  current.x = e.clientX;
  current.y = e.clientY;
});

// Listen for drawing events from the server
socket.on('draw', (data) => {
  localBoardState.push(data);
  drawLine(data);
});

// When a new client connects, the server sends the entire board state
socket.on('init', (state) => {
  localBoardState = state;
  redraw();
});

// Clear the board when the clear event is received from the server
socket.on('clear', () => {
  localBoardState = [];
  clearCanvas();
});

// Clear board button sends a clear event to the server
document.getElementById('clearButton').addEventListener('click', () => {
  socket.emit('clear');
});

// Function to draw a single line segment based on the data received
function drawLine({ x0, y0, x1, y1, color }) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
  context.closePath();
}
