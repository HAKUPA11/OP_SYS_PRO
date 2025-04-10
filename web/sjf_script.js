// script.js

let processes = [];
let isPreemptive = false;

const preemptiveCheckbox = document.getElementById('preemptiveMode');
if (preemptiveCheckbox) {
  preemptiveCheckbox.addEventListener('change', function () {
    isPreemptive = this.checked;
  });
}

document.getElementById('addProcessBtn').addEventListener('click', () => {
  const processId = document.getElementById('processId').value;
  const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
  const burstTime = parseInt(document.getElementById('burstTime').value);

  if (!processId || isNaN(arrivalTime) || isNaN(burstTime)) {
    alert('Please enter valid process details.');
    return;
  }

  processes.push({
    processId,
    arrivalTime,
    burstTime,
    remainingTime: burstTime,
    addedToReady: false,
  });

  updateProcessTable();
});

function updateProcessTable() {
  const tableBody = document.getElementById('processTable').querySelector('tbody');
  tableBody.innerHTML = '';

  processes.forEach((p) => {
    const row = `<tr><td>${p.processId}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

document.getElementById('resetBtn').addEventListener('click', () => {
  processes = [];
  document.getElementById('processTable').querySelector('tbody').innerHTML = '';
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('timeline').innerHTML = '';
  document.getElementById('readyBox').innerHTML = '';
  document.getElementById('runningBox').innerHTML = '';
  document.getElementById('terminatedBox').innerHTML = '';
  document.getElementById('avgWaitingTime').textContent = '0';
  document.getElementById('avgTurnaroundTime').textContent = '0';
  document.getElementById('currentTimeDisplay').textContent = '0';
});

document.getElementById('runSJFBtn').addEventListener('click', () => {
  if (processes.length === 0) {
    alert('No processes to run.');
    return;
  }

  const ganttChart = document.getElementById('ganttChart');
  const timeline = document.getElementById('timeline');
  const readyBox = document.getElementById('readyBox');
  const runningBox = document.getElementById('runningBox');
  const terminatedBox = document.getElementById('terminatedBox');
  ganttChart.innerHTML = '';
  timeline.innerHTML = '';
  readyBox.innerHTML = '';
  runningBox.innerHTML = '';
  terminatedBox.innerHTML = '';

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let completed = 0;

  function updateCurrentTimeDisplay(time) {
    document.getElementById('currentTimeDisplay').textContent = time;
  }

  function executeStep() {
    updateCurrentTimeDisplay(currentTime);

    if (completed === processes.length) {
      const avgWaitingTime = totalWaitingTime / processes.length;
      const avgTurnaroundTime = totalTurnaroundTime / processes.length;
      document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
      document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
      return;
    }

    processes.forEach((p) => {
      if (p.arrivalTime <= currentTime && p.remainingTime > 0 && !p.addedToReady) {
        const proc = document.createElement('span');
        proc.textContent = p.processId;
        readyBox.appendChild(proc);
        p.addedToReady = true;
      }
    });

    const available = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
    if (available.length === 0) {
      currentTime++;
      setTimeout(executeStep, 500);
      return;
    }

    let p;
    if (isPreemptive) {
      available.sort((a, b) => a.remainingTime - b.remainingTime);
      p = available[0];
      p.remainingTime--;

      const block = document.createElement('div');
      block.classList.add('gantt-block');
      block.style.width = '20px';
      block.style.backgroundColor = getRandomColor();
      block.textContent = p.processId;
      ganttChart.appendChild(block);

      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = currentTime;
      ganttChart.appendChild(timeLabel);

      runningBox.innerHTML = '';
      const runningProc = document.createElement('span');
      runningProc.textContent = p.processId;
      runningBox.appendChild(runningProc);

      if (p.remainingTime === 0) {
        completed++;
        const turnaroundTime = currentTime + 1 - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        totalTurnaroundTime += turnaroundTime;
        totalWaitingTime += waitingTime;
        timeline.innerHTML += `<div class="timeline-event">Process ${p.processId} completed at ${currentTime + 1}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}</div>`;

        const term = document.createElement('span');
        term.textContent = p.processId;
        terminatedBox.appendChild(term);
        runningBox.innerHTML = '';
      }

      currentTime++;
      setTimeout(executeStep, 500);
    } else {
      available.sort((a, b) => a.burstTime - b.burstTime);
      p = available[0];

      const startTime = Math.max(currentTime, p.arrivalTime);
      const endTime = startTime + p.burstTime;
      const turnaroundTime = endTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;

      totalTurnaroundTime += turnaroundTime;
      totalWaitingTime += waitingTime;

      runningBox.innerHTML = '';
      const runningProc = document.createElement('span');
      runningProc.textContent = p.processId;
      runningBox.appendChild(runningProc);

      const block = document.createElement('div');
      block.classList.add('gantt-block');
      block.style.width = `${p.burstTime * 20}px`;
      block.style.backgroundColor = getRandomColor();
      block.textContent = p.processId;
      ganttChart.appendChild(block);

      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = startTime;
      ganttChart.appendChild(timeLabel);

      timeline.innerHTML += `<div class="timeline-event">Process ${p.processId} started at ${startTime} and ended at ${endTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}</div>`;

      const term = document.createElement('span');
      term.textContent = p.processId;
      setTimeout(() => {
        terminatedBox.appendChild(term);
        runningBox.innerHTML = '';
      }, p.burstTime * 500);

      p.remainingTime = 0;
      completed++;
      for (let t = startTime; t < endTime; t++) {
        setTimeout(() => updateCurrentTimeDisplay(t + 1), (t - startTime + 1) * 500);
      }
      currentTime = endTime;
      setTimeout(executeStep, p.burstTime * 500);
    }
  }

  executeStep();
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
