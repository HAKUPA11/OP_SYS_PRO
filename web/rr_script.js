let processes = [];

function addProcess() {
  const processId = document.getElementById('processId').value;
  const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
  const burstTime = parseInt(document.getElementById('burstTime').value);

  if (processId === '' || isNaN(arrivalTime) || isNaN(burstTime)) {
    alert('Please enter valid process details.');
    return;
  }

  processes.push({ processId, arrivalTime, burstTime, remainingTime: burstTime, completionTime: 0 });
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

function runRoundRobin() {
  const timeQuantum = parseInt(document.getElementById('timeQuantum').value);

  if (processes.length === 0 || isNaN(timeQuantum) || timeQuantum <= 0) {
    alert('Please enter valid processes and time quantum.');
    return;
  }

  const ganttChart = document.getElementById('ganttChart');
  const timeline = document.getElementById('timeline');
  ganttChart.innerHTML = '';
  timeline.innerHTML = '';

  let currentTime = 0;
  let completed = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  const queue = [];

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  function addToQueue() {
    processes.forEach((p) => {
      if (p.arrivalTime <= currentTime && !queue.includes(p) && p.remainingTime > 0) {
        queue.push(p);
      }
    });
  }

  function executeNextStep() {
    addToQueue();

    if (queue.length === 0) {
      if (completed < processes.length) {
        currentTime++;
        setTimeout(executeNextStep, 500);
      } else {
        const avgWaitingTime = totalWaitingTime / processes.length;
        const avgTurnaroundTime = totalTurnaroundTime / processes.length;

        document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
        document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
      }
      return;
    }

    const p = queue.shift();
    const executeTime = Math.min(timeQuantum, p.remainingTime);
    p.remainingTime -= executeTime;
    currentTime += executeTime;

    const block = document.createElement('div');
    block.classList.add('gantt-block');
    block.style.width = `${executeTime * 20}px`;
    block.style.backgroundColor = getRandomColor();
    block.textContent = p.processId;
    ganttChart.appendChild(block);

    const timeMarker = document.createElement('div');
    timeMarker.classList.add('time-marker');
    timeMarker.textContent = `${currentTime}`;
    ganttChart.appendChild(timeMarker);

    if (p.remainingTime === 0) {
      p.completionTime = currentTime;
      completed++;
      const turnaroundTime = p.completionTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;

      totalTurnaroundTime += turnaroundTime;
      totalWaitingTime += waitingTime;

      const event = document.createElement('div');
      event.classList.add('timeline-event');
      event.textContent = `Process ${p.processId} completed at ${currentTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
      timeline.appendChild(event);
    } else {
      addToQueue();
      queue.push(p);
    }

    setTimeout(executeNextStep, 500);
  }

  executeNextStep();
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
