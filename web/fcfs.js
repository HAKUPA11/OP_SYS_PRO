let processes = [];
let simulationQueue = [];
let simulationInterval;
let currentSimulationIndex = 0;
let isPaused = false;

function addProcess() {
  const id = document.getElementById("processId").value.trim();
  const arrival = parseInt(document.getElementById("arrivalTime").value);
  const burst = parseInt(document.getElementById("burstTime").value);

  if (id && !isNaN(arrival) && !isNaN(burst)) {
    processes.push({ id, arrival, burst });
    renderTable();
    document.getElementById("processId").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
  }
}

function renderTable() {
  const tbody = document.querySelector("#processTable tbody");
  tbody.innerHTML = "";
  processes.forEach((p) => {
    const row = `<tr><td>${p.id}</td><td>${p.arrival}</td><td>${p.burst}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function runFCFS() {
  processes.sort((a, b) => a.arrival - b.arrival);
  const gantt = document.getElementById("ganttChart");
  const timeline = document.getElementById("timeline");
  gantt.innerHTML = "";
  timeline.innerHTML = "";
  simulationQueue = [];

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach((p) => {
    const startTime = Math.max(currentTime, p.arrival);
    const waitTime = startTime - p.arrival;
    const endTime = startTime + p.burst;
    const turnaroundTime = endTime - p.arrival;
    totalWaitingTime += waitTime;
    totalTurnaroundTime += turnaroundTime;

    // Random color
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    const block = document.createElement("div");
    block.className = "gantt-block";
    block.style.width = `${p.burst * 30}px`;
    block.style.backgroundColor = color;
    block.textContent = p.id;
    gantt.appendChild(block);

    timeline.innerHTML += `
      <div class="timeline-event">
        ${p.id} - Start: ${startTime}, End: ${endTime}, Waiting Time: ${waitTime}
      </div>
    `;

    simulationQueue.push({ id: p.id, waitTime, burst: p.burst });
    currentTime = endTime;
  });

  document.getElementById("avgWaitingTime").textContent = (totalWaitingTime / processes.length).toFixed(2);
  document.getElementById("avgTurnaroundTime").textContent = (totalTurnaroundTime / processes.length).toFixed(2);

  restartSimulation();
}

// ---- Simulation Controls ----

function playSimulation() {
  if (isPaused) {
    isPaused = false;
    simulateStateTransition();
  } else {
    restartSimulation();
  }
}

function pauseSimulation() {
  clearInterval(simulationInterval);
  isPaused = true;
}

function restartSimulation() {
  clearInterval(simulationInterval);
  currentSimulationIndex = 0;
  isPaused = false;
  document.getElementById("processIndicator").textContent = "";
  resetStateBoxes();
  simulateStateTransition();
}

function resetStateBoxes() {
  document.getElementById("readyBox").classList.remove("active-state");
  document.getElementById("runningBox").classList.remove("active-state");
  document.getElementById("terminatedBox").classList.remove("active-state");
}

function simulateStateTransition() {
  if (currentSimulationIndex >= simulationQueue.length) return;

  const process = simulationQueue[currentSimulationIndex];
  document.getElementById("processIndicator").textContent = `Simulating ${process.id}`;

  resetStateBoxes();
  document.getElementById("readyBox").classList.add("active-state");

  setTimeout(() => {
    if (isPaused) return;

    resetStateBoxes();
    document.getElementById("runningBox").classList.add("active-state");

    setTimeout(() => {
      if (isPaused) return;

      resetStateBoxes();
      document.getElementById("terminatedBox").classList.add("active-state");

      currentSimulationIndex++;
      setTimeout(() => {
        simulateStateTransition();
      }, 800);
    }, process.burst * 400);
  }, 800);
}
