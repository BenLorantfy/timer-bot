const server = require('http').createServer();
const io = require('socket.io')(server);
const electron = require('electron');
const fs = require('fs');
const stopButtonId = 3;

if (!localStorage.getItem("state")) {
  localStorage.setItem("state", JSON.stringify({
    buttons: []
  }));
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  

  
  let activeButtonId = null;
  let lastPressedButtonId = null;
  
  updateButtons();
  io.on('connection', socket => {
    socket.on('button_press', (buttonId) => {
      if (buttonId === stopButtonId) {
        activeButtonId = null;
        lastPressedButtonId = null;
        updateButtons();
        saveTime();
        return;
      }

      activeButtonId = buttonId;
      updateButtons();
      stopAndStart();

    });

    socket.on('double_button_press', (buttonId) => {
      if (buttonId === stopButtonId) {
        saveTime();
        return;
      }

      lastPressedButtonId = buttonId;

      const state = JSON.parse(localStorage.getItem("state"));
      window.document.getElementById("header").innerText = `Set button #${buttonId} project/ticket`
      electron.remote.app.focus({ steal: true });

      const button = state.buttons.find((button) => button.id === buttonId);
      if (button) {
        document.getElementById("project").value = button.currentProject || "";
        document.getElementById("ticket").value = button.currentTicket || "";
      }
    });

    window.document.getElementById("save-and-start").addEventListener("click", () => {
      const newProject = document.getElementById("project").value;
      const newTicket = document.getElementById("ticket").value;

      const state = JSON.parse(localStorage.getItem("state"));
      const button = state.buttons.find((button) => button.id === lastPressedButtonId);
      button.currentProject = newProject;
      button.currentTicket = newTicket;
      activeProject = newProject;
      activeTicket = newTicket;
      activeButtonId = lastPressedButtonId;

      localStorage.setItem("state", JSON.stringify(state));
      updateButtons();
      stopAndStart();
    })
  });

  server.listen(3456);

  let stream = fs.createWriteStream("logs.csv", {flags:'a'});
  let trackingProjectName = null;
  let trackingTicketName = null;
  let started = null;
  function stopAndStart() {
    // Stop and log
    saveTime();
    
    // Start new
    const state = JSON.parse(localStorage.getItem("state"));
    const button = state.buttons.find((button) => button.id === activeButtonId);
    trackingProjectName = button.currentProject;
    trackingTicketName = button.currentTicket;
    started = new Date().toISOString();
  }

  function saveTime() {
    if (started) {
      const stopped = new Date().toISOString();
      stream.write(`"${trackingProjectName}","${trackingTicketName}","${started}","${stopped}"\n`);
      trackingProjectName = null;
      trackingTicketName = null;
      trackingTicketName = null;
      started = null;
    }
  }

  function updateButtons() {
    document.getElementById("buttons-row").innerText = "";

    const state = JSON.parse(localStorage.getItem("state"));
    state.buttons.forEach((button) => {
      const div = document.createElement("div");
      div.className = "button";
      if (button.id === activeButtonId) {
        div.className += " active";
      }

      div.innerText = button.currentProject + "\n" + button.currentTicket;
      document.getElementById("buttons-row").appendChild(div);
    })
  }
})
