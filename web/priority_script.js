



let processes = [];
let currentTime = 0;
let totalWaitingTime = 0;
let totalTurnaroundTime = 0;
let completed = 0;
let isPreemptive = false;

document.getElementById('preemptiveMode').addEventListener('change', function () {
  isPreemptive = this.checked;
});

function addProcess() {
  const processId = document.getElementById('processId').value.trim();
  const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
  const burstTime = parseInt(document.getElementById('burstTime').value);
  const priority = parseInt(document.getElementById('priority').value);

  if (!processId || isNaN(arrivalTime) || isNaN(burstTime) || isNaN(priority)) {
    alert("Please fill all fields correctly.");
    return;
  }

  processes.push({
    processId,
    arrivalTime,
    burstTime,
    remainingTime: burstTime,
    priority,
    completionTime: 0
  });

  updateProcessTable();
}

function updateProcessTable() {
  const tableBody = document.querySelector('#processTable tbody');
  tableBody.innerHTML = '';

  processes.forEach(p => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.processId}</td>
        <td>${p.arrivalTime}</td>
        <td>${p.burstTime}</td>
        <td>${p.priority}</td>
      </tr>`;
  });
}

function runPriorityScheduling() {
  if (processes.length === 0) {
    alert('No processes to simulate.');
    return;
  }

  currentTime = 0;
  completed = 0;
  totalWaitingTime = 0;
  totalTurnaroundTime = 0;

  document.getElementById('readyBox').innerHTML = '';
  document.getElementById('runningBox').innerHTML = '';
  document.getElementById('terminatedBox').innerHTML = '';
  document.getElementById('readyQueueBox').innerHTML = '';
  document.getElementById('timeline').innerHTML = '';
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('avgWaitingTime').textContent = 'Avg WT: --';
  document.getElementById('avgTurnaroundTime').textContent = 'Avg TAT: --';

  function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = `Timer: ${currentTime}`;
  }

  function drawProcessBox(containerId, processId, color = '#ccc') {
    const div = document.createElement('div');
    div.className = 'process';
    div.textContent = processId;
    div.style.backgroundColor = color;
    document.getElementById(containerId).appendChild(div);
  }

  function executeStep() {
    if (completed === processes.length) {
      document.getElementById('readyBox').innerHTML = '';
      document.getElementById('readyQueueBox').innerHTML = '';
      document.getElementById('runningBox').innerHTML = '';

      document.getElementById('avgWaitingTime').textContent =
        `Avg WT: ${(totalWaitingTime / processes.length).toFixed(2)}`;
      document.getElementById('avgTurnaroundTime').textContent =
        `Avg TAT: ${(totalTurnaroundTime / processes.length).toFixed(2)}`;
      return;
    }

    updateTimerDisplay();

    const readyQueue = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
    readyQueue.sort((a, b) => a.priority - b.priority);

    document.getElementById('readyBox').innerHTML = '';
    document.getElementById('readyQueueBox').innerHTML = '';
    readyQueue.forEach(p => {
      drawProcessBox('readyBox', p.processId);
      drawProcessBox('readyQueueBox', p.processId);
    });

    if (readyQueue.length === 0) {
      currentTime++;
      setTimeout(executeStep, 900); // slower step
      return;
    }

    const currentProcess = readyQueue[0];

    document.getElementById('runningBox').innerHTML = '';
    drawProcessBox('runningBox', currentProcess.processId, 'orange');

    if (isPreemptive) {
      currentProcess.remainingTime--;
      drawGanttBlock(currentProcess.processId, currentTime);
      currentTime++;

      if (currentProcess.remainingTime === 0) {
        completeProcess(currentProcess);
        document.getElementById('runningBox').innerHTML = '';
      }
    } else {
      drawGanttBlock(currentProcess.processId, currentTime, currentProcess.burstTime);
      currentTime += currentProcess.burstTime;
      currentProcess.remainingTime = 0;
      completeProcess(currentProcess);
      document.getElementById('runningBox').innerHTML = '';
    }

    setTimeout(executeStep, 900); // slower step
  }

  function completeProcess(p) {
    completed++;
    p.completionTime = currentTime;
    const turnaroundTime = p.completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;

    drawProcessBox('terminatedBox', p.processId, 'lightgreen');

    const event = document.createElement('div');
    event.className = 'timeline-event';
    event.textContent = `Process ${p.processId} completed at ${currentTime}, TAT: ${turnaroundTime}, WT: ${waitingTime}`;
    document.getElementById('timeline').appendChild(event);
  }

  function drawGanttBlock(processId, startTime, duration = 1) {
    const block = document.createElement('div');
    block.className = 'gantt-block';
    block.style.width = `${duration * 25}px`;
    block.textContent = processId;
    block.style.backgroundColor = getRandomColor();

    const ganttChart = document.getElementById('ganttChart');
    ganttChart.appendChild(block);

    const marker = document.createElement('div');
    marker.className = 'time-marker';
    marker.textContent = startTime + duration;
    ganttChart.appendChild(marker);
  }

  executeStep();
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  return '#' + Array.from({ length: 6 }, () =>
    letters[Math.floor(Math.random() * 16)]
  ).join('');
}
