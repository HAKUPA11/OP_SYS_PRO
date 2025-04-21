

let processes = [];
    let simulationQueue = [];
    let simulationSchedule = [];
    let currentSimulationIndex = 0;
    let isPaused = false;
    let simulationTime = 0;
    let simulationInterval;

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
      simulationSchedule = [];

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

        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        const block = document.createElement("div");
        block.className = "gantt-block";
        block.style.width = `${p.burst * 30}px`;
        block.style.backgroundColor = color;
        block.textContent = p.id;
        gantt.appendChild(block);

        const timelineDiv = document.createElement("div");
        timelineDiv.className = "timeline-event";
        timelineDiv.textContent = `${p.id} - Start: ${startTime}, End: ${endTime}, Waiting Time: ${waitTime}`;
        timeline.appendChild(timelineDiv);

        simulationQueue.push({ id: p.id, waitTime, burst: p.burst, arrival: p.arrival });
        simulationSchedule.push({ id: p.id, start: startTime, end: endTime });
        currentTime = endTime;
      });

      document.getElementById("avgWaitingTime").textContent = (totalWaitingTime / processes.length).toFixed(2);
      document.getElementById("avgTurnaroundTime").textContent = (totalTurnaroundTime / processes.length).toFixed(2);

      restartSimulation();
    }

    function playSimulation() {
      if (isPaused) {
        isPaused = false;
      } else {
        restartSimulation();
      }
      simulateStateTransition();
    }

    function pauseSimulation() {
      clearInterval(simulationInterval);
      isPaused = true;
    }

    function restartSimulation() {
      clearInterval(simulationInterval);
      currentSimulationIndex = 0;
      simulationTime = 0;
      isPaused = false;
      document.getElementById("processIndicator").textContent = "";
      resetStateBoxes();
      document.getElementById("readyQueueDisplay").innerHTML = "";
    }

    function resetStateBoxes() {
      document.getElementById("readyBox").classList.remove("active-state");
      document.getElementById("runningBox").classList.remove("active-state");
      document.getElementById("terminatedBox").classList.remove("active-state");
    }

    function simulateStateTransition() {
      if (simulationQueue.length === 0) return;

      let currentProcess = simulationQueue[currentSimulationIndex];
      let currentStart = simulationSchedule[currentSimulationIndex].start;
      let currentEnd = simulationSchedule[currentSimulationIndex].end;

      simulationInterval = setInterval(() => {
        if (isPaused) return;

        document.getElementById("processIndicator").textContent = `Time: ${simulationTime}`;

        updateReadyQueueLive(simulationTime, currentProcess?.id);

        if (simulationTime === currentStart) {
          resetStateBoxes();
          document.getElementById("readyBox").classList.add("active-state");
        }

        if (simulationTime === currentStart + 1) {
          resetStateBoxes();
          document.getElementById("runningBox").classList.add("active-state");
          document.getElementById("processIndicator").textContent += ` — Running ${currentProcess.id}`;
        }

        if (simulationTime === currentEnd) {
          resetStateBoxes();
          document.getElementById("terminatedBox").classList.add("active-state");
          currentSimulationIndex++;

          if (currentSimulationIndex < simulationQueue.length) {
            currentProcess = simulationQueue[currentSimulationIndex];
            currentStart = simulationSchedule[currentSimulationIndex].start;
            currentEnd = simulationSchedule[currentSimulationIndex].end;
          } else {
            clearInterval(simulationInterval);
            document.getElementById("processIndicator").textContent = "Simulation Complete";
          }
        }

        simulationTime++;
      }, 800);
    }

    function updateReadyQueueLive(currentTime, runningId) {
      const display = document.getElementById("readyQueueDisplay");
      display.innerHTML = "In Ready Queue: ";

      const readyQueue = simulationQueue.filter((p, i) => {
        const hasArrived = p.arrival <= currentTime;
        const notRunning = p.id !== runningId;
        const notFinished = simulationSchedule[i].end > currentTime;
        return hasArrived && notRunning && notFinished;
      });

      if (readyQueue.length === 0) {
        display.innerHTML += "<i>No process currently waiting</i>";
      } else {
        readyQueue.forEach((p) => {
          const span = document.createElement("span");
          span.textContent = p.id;
          display.appendChild(span);
        });
      }
    }