let processes = [];
let isPreemptive = false;


const preemptiveCheckbox = document.getElementById('preemptiveMode');
if (preemptiveCheckbox) {
  preemptiveCheckbox.addEventListener('change', function() {
    isPreemptive = this.checked;
  });
}


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


function runSJF() {
  if (processes.length === 0) {
    alert('No processes to run.');
    return;
  }

  const ganttChart = document.getElementById('ganttChart');
  const timeline = document.getElementById('timeline');
  ganttChart.innerHTML = '';
  timeline.innerHTML = '';

  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let completed = 0;

  function executeNextStep() {
    if (completed === processes.length) {
      const avgWaitingTime = totalWaitingTime / processes.length;
      const avgTurnaroundTime = totalTurnaroundTime / processes.length;

      document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
      document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);

      const finalTimeMarker = document.createElement('div');
      finalTimeMarker.classList.add('time-marker');
      finalTimeMarker.textContent = `${currentTime}`;
      ganttChart.appendChild(finalTimeMarker);
      return;
    }

    const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

    if (availableProcesses.length === 0) {
      currentTime++;
      setTimeout(executeNextStep, 500);
      return;
    }

    if (isPreemptive) {
      availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
      const p = availableProcesses[0];
      p.remainingTime--;
      currentTime++;

      const block = document.createElement('div');
      block.classList.add('gantt-block');
      block.style.width = `20px`;
      block.style.backgroundColor = getRandomColor();
      block.textContent = p.processId;
      ganttChart.appendChild(block);

      const timeMarker = document.createElement('div');
      timeMarker.classList.add('time-marker');
      timeMarker.textContent = `${currentTime}`;
      ganttChart.appendChild(timeMarker);

      if (p.remainingTime === 0) {
        completed++;
        const turnaroundTime = currentTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        totalTurnaroundTime += turnaroundTime;
        totalWaitingTime += waitingTime;

        const event = document.createElement('div');
        event.classList.add('timeline-event');
        event.textContent = `Process ${p.processId} completed at ${currentTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
        timeline.appendChild(event);
      }
    } else {
      availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
      const p = availableProcesses[0];

      const startTime = Math.max(currentTime, p.arrivalTime);
      const endTime = startTime + p.burstTime;
      const turnaroundTime = endTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;

      totalTurnaroundTime += turnaroundTime;
      totalWaitingTime += waitingTime;

      const block = document.createElement('div');
      block.classList.add('gantt-block');
      block.style.width = `${p.burstTime * 20}px`;
      block.style.backgroundColor = getRandomColor();
      block.textContent = p.processId;
      ganttChart.appendChild(block);

      const timeMarker = document.createElement('div');
      timeMarker.classList.add('time-marker');
      timeMarker.textContent = `${startTime}`;
      ganttChart.appendChild(timeMarker);

      const event = document.createElement('div');
      event.classList.add('timeline-event');
      event.textContent = `Process ${p.processId} started at ${startTime} and ended at ${endTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
      timeline.appendChild(event);

      currentTime = endTime;
      p.remainingTime = 0;
      completed++;
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

























// let processes = [];
// let isPreemptive = false;

// // Toggle preemptive mode
// const preemptiveCheckbox = document.getElementById('preemptiveMode');
// if (preemptiveCheckbox) {
//   preemptiveCheckbox.addEventListener('change', function() {
//     isPreemptive = this.checked;
//   });
// }

// // Add a process to the table
// function addProcess() {
//   const processId = document.getElementById('processId').value;
//   const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
//   const burstTime = parseInt(document.getElementById('burstTime').value);

//   if (processId === '' || isNaN(arrivalTime) || isNaN(burstTime)) {
//     alert('Please enter valid process details.');
//     return;
//   }

//   processes.push({ processId, arrivalTime, burstTime, remainingTime: burstTime, state: 'Ready' });
//   updateProcessTable();
// }

// // Update the process table
// function updateProcessTable() {
//   const tableBody = document.getElementById('processTable').querySelector('tbody');
//   tableBody.innerHTML = '';

//   processes.forEach((p) => {
//     const row = `<tr><td>${p.processId}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td></tr>`;
//     tableBody.innerHTML += row;
//   });
// }

// // Update state transition diagram
// function updateStateDiagram(processId, newState) {
//   const stateDiagram = document.getElementById('stateDiagram');
//   const stateEntry = document.createElement('div');
//   stateEntry.classList.add('state-entry');
//   stateEntry.textContent = `Process ${processId} → ${newState}`;
//   stateDiagram.appendChild(stateEntry);
// }

// // Run SJF Scheduling with visualization
// function runSJF() {
//   if (processes.length === 0) {
//     alert('No processes to run.');
//     return;
//   }

//   const ganttChart = document.getElementById('ganttChart');
//   const timeline = document.getElementById('timeline');
//   ganttChart.innerHTML = '';
//   timeline.innerHTML = '';

//   let currentTime = 0;
//   let totalWaitingTime = 0;
//   let totalTurnaroundTime = 0;
//   let completed = 0;

//   function executeNextStep() {
//     if (completed === processes.length) {
//       const avgWaitingTime = totalWaitingTime / processes.length;
//       const avgTurnaroundTime = totalTurnaroundTime / processes.length;

//       document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
//       document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
//       return;
//     }

//     const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

//     if (availableProcesses.length === 0) {
//       currentTime++;
//       setTimeout(executeNextStep, 500);
//       return;
//     }

//     if (isPreemptive) {
//       availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime);
//       const p = availableProcesses[0];
//       p.remainingTime--;
//       p.state = 'Running';
//       updateStateDiagram(p.processId, 'Running');
//       currentTime++;

//       const block = document.createElement('div');
//       block.classList.add('gantt-block');
//       block.style.width = `20px`;
//       block.style.backgroundColor = getRandomColor();
//       block.textContent = p.processId;
//       ganttChart.appendChild(block);

//       const timeMarker = document.createElement('div');
//       timeMarker.classList.add('time-marker');
//       timeMarker.textContent = `${currentTime}`;
//       ganttChart.appendChild(timeMarker);

//       if (p.remainingTime === 0) {
//         completed++;
//         p.state = 'Terminated';
//         updateStateDiagram(p.processId, 'Terminated');
//         const turnaroundTime = currentTime - p.arrivalTime;
//         const waitingTime = turnaroundTime - p.burstTime;
//         totalTurnaroundTime += turnaroundTime;
//         totalWaitingTime += waitingTime;

//         const event = document.createElement('div');
//         event.classList.add('timeline-event');
//         event.textContent = `Process ${p.processId} completed at ${currentTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
//         timeline.appendChild(event);
//       }
//     } else {
//       availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
//       const p = availableProcesses[0];

//       const startTime = Math.max(currentTime, p.arrivalTime);
//       const endTime = startTime + p.burstTime;
//       const turnaroundTime = endTime - p.arrivalTime;
//       const waitingTime = turnaroundTime - p.burstTime;

//       totalTurnaroundTime += turnaroundTime;
//       totalWaitingTime += waitingTime;

//       p.state = 'Running';
//       updateStateDiagram(p.processId, 'Running');

//       const block = document.createElement('div');
//       block.classList.add('gantt-block');
//       block.style.width = `${p.burstTime * 20}px`;
//       block.style.backgroundColor = getRandomColor();
//       block.textContent = p.processId;
//       ganttChart.appendChild(block);

//       const timeMarker = document.createElement('div');
//       timeMarker.classList.add('time-marker');
//       timeMarker.textContent = `${startTime}`;
//       ganttChart.appendChild(timeMarker);

//       const event = document.createElement('div');
//       event.classList.add('timeline-event');
//       event.textContent = `Process ${p.processId} started at ${startTime} and ended at ${endTime}. Turnaround Time: ${turnaroundTime}, Waiting Time: ${waitingTime}`;
//       timeline.appendChild(event);

//       currentTime = endTime;
//       p.remainingTime = 0;
//       p.state = 'Terminated';
//       updateStateDiagram(p.processId, 'Terminated');
//       completed++;
//     }

//     setTimeout(executeNextStep, 500);
//   }

//   executeNextStep();
// }

// // Generate random colors for Gantt Chart blocks
// function getRandomColor() {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }












