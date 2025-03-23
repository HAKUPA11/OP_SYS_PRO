let processes = [];
let isPreemptive = false;

function addProcess() {
  const processId = document.getElementById('processId').value;
  const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
  const burstTime = parseInt(document.getElementById('burstTime').value);

  if (processId === '' || isNaN(arrivalTime) || isNaN(burstTime)) {
    alert('Please enter valid process details.');
    return;
  }

  processes.push({ processId, arrivalTime, burstTime, remainingTime: burstTime });
  updateProcessTable();
}

function updateProcessTable() {
  const tableBody = document.getElementById('processTable').querySelector('tbody');
  tableBody.innerHTML = '';

  processes.forEach((p) => {
    const row = `<tr><td>${p.processId}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

function runFCFS() {
  if (processes.length === 0) {
    alert('No processes to run.');
    return;
  }

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const ganttChart = document.getElementById('ganttChart');
  const timeline = document.getElementById('timeline');
  ganttChart.innerHTML = '';
  timeline.innerHTML = '';

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach((p) => {
    const startTime = Math.max(currentTime, p.arrivalTime);
    const endTime = startTime + p.burstTime;
    const duration = endTime - startTime;

    const turnaroundTime = endTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;

    // Update Gantt Chart
    const block = document.createElement('div');
    block.classList.add('gantt-block');
    block.style.width = `${duration * 20}px`;
    block.style.backgroundColor = getRandomColor();
    block.textContent = p.processId;
    ganttChart.appendChild(block);

    const timeMarker = document.createElement('div');
    timeMarker.classList.add('time-marker');
    timeMarker.textContent = `${startTime}`;
    ganttChart.appendChild(timeMarker);

    currentTime = endTime;

    // Update Timeline
    const event = document.createElement('div');
    event.classList.add('timeline-event');
    event.textContent = `Process ${p.processId} started at ${startTime} and ended at ${endTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
    timeline.appendChild(event);
  });

  const finalMarker = document.createElement('div');
  finalMarker.classList.add('time-marker');
  finalMarker.textContent = `${currentTime}`;
  ganttChart.appendChild(finalMarker);

  const avgWaitingTime = totalWaitingTime / processes.length;
  const avgTurnaroundTime = totalTurnaroundTime / processes.length;

  document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
  document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function togglePreemptive() {
  alert('FCFS does not support preemptive mode. The option will remain disabled.');
  document.getElementById('preemptiveMode').checked = false;
}
