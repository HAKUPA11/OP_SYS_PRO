// let processes = [];

// function addProcess() {
//   const processId = document.getElementById('processId').value;
//   const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
//   const burstTime = parseInt(document.getElementById('burstTime').value);

//   if (processId === '' || isNaN(arrivalTime) || isNaN(burstTime)) {
//     alert('Please enter valid process details.');
//     return;
//   }

//   processes.push({ processId, arrivalTime, burstTime, remainingTime: burstTime, completionTime: 0 });
//   updateProcessTable();
// }

// function updateProcessTable() {
//   const tableBody = document.getElementById('processTable').querySelector('tbody');
//   tableBody.innerHTML = '';

//   processes.forEach((p) => {
//     const row = `<tr><td>${p.processId}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td></tr>`;
//     tableBody.innerHTML += row;
//   });
// }

// function runRoundRobin() {
//   const timeQuantum = parseInt(document.getElementById('timeQuantum').value);

//   if (processes.length === 0 || isNaN(timeQuantum) || timeQuantum <= 0) {
//     alert('Please enter valid processes and time quantum.');
//     return;
//   }

//   const ganttChart = document.getElementById('ganttChart');
//   const timeline = document.getElementById('timeline');
//   ganttChart.innerHTML = '';
//   timeline.innerHTML = '';

//   let currentTime = 0;
//   let completed = 0;
//   let totalWaitingTime = 0;
//   let totalTurnaroundTime = 0;
//   const queue = [];

//   processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

//   function addToQueue() {
//     processes.forEach((p) => {
//       if (p.arrivalTime <= currentTime && !queue.includes(p) && p.remainingTime > 0) {
//         queue.push(p);
//       }
//     });
//   }

//   function executeNextStep() {
//     addToQueue();

//     if (queue.length === 0) {
//       if (completed < processes.length) {
//         currentTime++;
//         setTimeout(executeNextStep, 500);
//       } else {
//         const avgWaitingTime = totalWaitingTime / processes.length;
//         const avgTurnaroundTime = totalTurnaroundTime / processes.length;

//         document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
//         document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
//       }
//       return;
//     }

//     const p = queue.shift();
//     const executeTime = Math.min(timeQuantum, p.remainingTime);
//     p.remainingTime -= executeTime;
//     currentTime += executeTime;

//     const block = document.createElement('div');
//     block.classList.add('gantt-block');
//     block.style.width = `${executeTime * 20}px`;
//     block.style.backgroundColor = getRandomColor();
//     block.textContent = p.processId;
//     ganttChart.appendChild(block);

//     const timeMarker = document.createElement('div');
//     timeMarker.classList.add('time-marker');
//     timeMarker.textContent = `${currentTime}`;
//     ganttChart.appendChild(timeMarker);

//     if (p.remainingTime === 0) {
//       p.completionTime = currentTime;
//       completed++;
//       const turnaroundTime = p.completionTime - p.arrivalTime;
//       const waitingTime = turnaroundTime - p.burstTime;

//       totalTurnaroundTime += turnaroundTime;
//       totalWaitingTime += waitingTime;

//       const event = document.createElement('div');
//       event.classList.add('timeline-event');
//       event.textContent = `Process ${p.processId} completed at ${currentTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
//       timeline.appendChild(event);
//     } else {
//       addToQueue();
//       queue.push(p);
//     }

//     setTimeout(executeNextStep, 500);
//   }

//   executeNextStep();
// }

// function getRandomColor() {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }

// rr_script.js
// rr_script.js

let processes = [];
let simulationRunning = false;
let simulationPaused = false;
let currentTime = 0;
let simulationInterval = null;
let queue = [];

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
  if (simulationRunning) return;

  const timeQuantum = parseInt(document.getElementById('timeQuantum').value);

  if (processes.length === 0 || isNaN(timeQuantum) || timeQuantum <= 0) {
    alert('Please enter valid processes and time quantum.');
    return;
  }

  const ganttChart = document.getElementById('ganttChart');
  const timeLabels = document.getElementById('timeLabels');
  const timeline = document.getElementById('timeline');
  const readyQueueBox = document.getElementById('readyBox');
  const runningQueueBox = document.getElementById('runningBox');
  const terminatedQueueBox = document.getElementById('terminatedBox');

  ganttChart.innerHTML = '';
  timeLabels.innerHTML = '';
  timeline.innerHTML = '';
  readyQueueBox.innerHTML = '';
  runningQueueBox.innerHTML = '';
  terminatedQueueBox.innerHTML = '';
  document.getElementById('simulationTime').textContent = '0';

  simulationRunning = true;
  simulationPaused = false;
  currentTime = 0;
  queue = [];
  let completed = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach(p => {
    p.remainingTime = p.burstTime;
    p.completionTime = 0;
    p.started = false;
  });

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  function updateQueues() {
    readyQueueBox.innerHTML = '';
    runningQueueBox.innerHTML = '';
    terminatedQueueBox.innerHTML = '';

    queue.forEach(p => {
      if (p.remainingTime > 0) {
        readyQueueBox.innerHTML += `<span>${p.processId}</span>`;
      }
    });

    processes.forEach(p => {
      if (p.remainingTime === 0 && p.completionTime !== 0) {
        terminatedQueueBox.innerHTML += `<span>${p.processId}</span>`;
      }
    });
  }

  function stepSimulation() {
    if (!simulationRunning || simulationPaused) return;

    processes.forEach(p => {
      if (p.arrivalTime <= currentTime && p.remainingTime > 0 && !queue.includes(p)) {
        queue.push(p);
      }
    });

    updateQueues();

    if (queue.length === 0) {
      currentTime++;
      document.getElementById('simulationTime').textContent = currentTime;
      setTimeout(stepSimulation, 500);
      return;
    }

    const p = queue.shift();
    const executeTime = Math.min(timeQuantum, p.remainingTime);

    let executed = 0;
    runningQueueBox.innerHTML = `<span>${p.processId}</span>`;

    const block = document.createElement('div');
    block.classList.add('gantt-block');
    block.style.width = `${executeTime * 30}px`;
    block.style.backgroundColor = getRandomColor();
    block.textContent = p.processId;
    block.style.position = 'relative';
    ganttChart.appendChild(block);

    const startTime = currentTime;
    const startTimeLabel = document.createElement('div');
    startTimeLabel.textContent = startTime;
    startTimeLabel.style.left = `${startTime * 30}px`;
    startTimeLabel.style.position = 'absolute';
    startTimeLabel.style.transform = 'translateX(-50%)';
    startTimeLabel.classList.add('time-label');
    timeLabels.appendChild(startTimeLabel);

    simulationInterval = setInterval(() => {
      if (simulationPaused) return;

      currentTime++;
      executed++;
      p.remainingTime--;
      document.getElementById('simulationTime').textContent = currentTime;

      processes.forEach(proc => {
        if (proc.arrivalTime <= currentTime && proc.remainingTime > 0 && !queue.includes(proc)) {
          queue.push(proc);
        }
      });

      updateQueues();

      if (executed >= executeTime) {
        clearInterval(simulationInterval);

        const endTimeLabel = document.createElement('div');
        endTimeLabel.textContent = currentTime;
        endTimeLabel.style.left = `${currentTime * 30}px`;
        endTimeLabel.style.position = 'absolute';
        endTimeLabel.style.transform = 'translateX(-50%)';
        endTimeLabel.classList.add('time-label');
        timeLabels.appendChild(endTimeLabel);

        // if (p.remainingTime === 0) {
        //   p.completionTime = currentTime;
        //   completed++;

        //   const turnaroundTime = p.completionTime - p.arrivalTime;
        //   const waitingTime = turnaroundTime - p.burstTime;

        //   totalTurnaroundTime += turnaroundTime;
        //   totalWaitingTime += waitingTime;

        //   const event = document.createElement('div');
        //   event.classList.add('timeline-event');
        //   event.textContent = `Process ${p.processId} completed at ${currentTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
        //   timeline.appendChild(event);
        // } else {
        //   queue.push(p);
        // }
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
        
          // Immediately update the terminated box
          const terminatedBox = document.getElementById('terminatedBox');
          const span = document.createElement('span');
          span.textContent = p.processId;
          terminatedBox.appendChild(span);
        } else {
          queue.push(p);
        }
        

        if (completed === processes.length) {
          simulationRunning = false;
          const avgWaitingTime = totalWaitingTime / processes.length;
          const avgTurnaroundTime = totalTurnaroundTime / processes.length;
          document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
          document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
        } else {
          setTimeout(stepSimulation, 300);
        }
      }
    }, 700);
  }

  stepSimulation();
}

function pauseSimulation() {
  simulationPaused = true;
}

function resumeSimulation() {
  if (!simulationRunning) return;
  simulationPaused = false;
}

function resetSimulation() {
  clearInterval(simulationInterval);
  simulationRunning = false;
  simulationPaused = false;
  currentTime = 0;
  processes = [];
  queue = [];

  document.getElementById('processTable').querySelector('tbody').innerHTML = '';
  document.getElementById('ganttChart').innerHTML = '';
  document.getElementById('timeLabels').innerHTML = '';
  document.getElementById('timeline').innerHTML = '';
  document.getElementById('readyBox').innerHTML = '';
  document.getElementById('runningBox').innerHTML = '';
  document.getElementById('terminatedBox').innerHTML = '';
  document.getElementById('avgWaitingTime').textContent = '-';
  document.getElementById('avgTurnaroundTime').textContent = '-';
  document.getElementById('simulationTime').textContent = '0';
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
