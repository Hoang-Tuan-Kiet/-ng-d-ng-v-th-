const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const logBox = document.getElementById("log");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let graph = {};
let nodes = [];
let edges = [];
let pos = {};
let visited = [];
let timer = null;

/* ===== LOG ===== */
function log(msg) {
  logBox.textContent += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}


/* ===== BUILD GRAPH ===== */
function buildGraph() {
  clearInterval(timer);
  graph = {};
  pos = {};
  visited = [];
  logBox.textContent = "";

  nodes = document.getElementById("vertices").value.split(",").map(v=>v.trim());
  edges = document.getElementById("edges").value.split("\n").map(e=>e.trim());

  nodes.forEach(v=>graph[v]=[]);

  edges.forEach(e=>{
    if(!e) return;
    const [u,v] = e.split("-");
    graph[u].push(v);
    graph[v].push(u);
  });

  initPosition();
  draw();
  log("Graph loaded");
}

/* ===== POSITION ===== */
function initPosition() {
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  const r = 200;

  nodes.forEach((n,i)=>{
    const a = 2*Math.PI*i/nodes.length;
    pos[n] = {
      x: cx + r*Math.cos(a),
      y: cy + r*Math.sin(a)
    };
  });
}

/* ===== DRAW ===== */
function draw(highlight=[]) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for (let u in graph) {
    graph[u].forEach(v=>{
      ctx.beginPath();
      ctx.moveTo(pos[u].x,pos[u].y);
      ctx.lineTo(pos[v].x,pos[v].y);
      ctx.strokeStyle = "#888";
      ctx.stroke();
    });
  }

  nodes.forEach(n=>{
    ctx.beginPath();
    ctx.arc(pos[n].x,pos[n].y,18,0,2*Math.PI);
    ctx.fillStyle = highlight.includes(n) ? "#ffcc00" : "#9ad0d3";
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(n,pos[n].x-5,pos[n].y+5);
  });
}

/* ===== RESET ===== */
function resetGraph() {
  clearInterval(timer);
  visited = [];
  draw();
  log("Graph reset");
}

/* ===== SELECT ALGO ===== */
function selectAlgo(e,type) {
  document.querySelectorAll(".algo-bar button")
    .forEach(b=>b.classList.remove("active"));
  e.target.classList.add("active");

  resetGraph();

  switch(type) {
    case "bfs": runBFS(); break;
    case "dfs": runDFS(); break;
    default: log("Thuật toán nâng cao: demo animation"); demoRun(); 
  }
}

/* ===== BFS ===== */
function runBFS() {
  const start = document.getElementById("start").value;
  let q = [start];
  let seen = new Set();

  animate(()=>{
    if(!q.length) return null;
    let u = q.shift();
    if(seen.has(u)) return "";
    seen.add(u);
    graph[u].forEach(v=>q.push(v));
    return u;
  },"BFS");
}

/* ===== DFS ===== */
function runDFS() {
  const start = document.getElementById("start").value;
  let stack = [start];
  let seen = new Set();

  animate(()=>{
    if(!stack.length) return null;
    let u = stack.pop();
    if(seen.has(u)) return "";
    seen.add(u);
    graph[u].forEach(v=>stack.push(v));
    return u;
  },"DFS");
}

/* ===== ANIMATION ENGINE ===== */
function animate(stepFn,name) {
  log("Running " + name);
  timer = setInterval(()=>{
    const node = stepFn();
    if(node === null){
      clearInterval(timer);
      log(name + " finished");
      return;
    }
    if(node){
      visited.push(node);
      log("Visit: " + node);
      draw(visited);
    }
  },600);
}

/* ===== DEMO ===== */
function demoRun() {
  animate(()=>{
    if(visited.length>=nodes.length) return null;
    return nodes[visited.length];
  },"Demo");
}
