const Gpio = require('onoff').Gpio;
const socket = require('socket.io-client')('http://192.168.2.17:3456');

const buttons = [
  new Gpio(21, 'in', 'rising', { debounceTimeout: 10 }),
  new Gpio(16, 'in', 'rising', { debounceTimeout: 10 }),
  new Gpio(20, 'in', 'rising', { debounceTimeout: 10 })
];

socket.on("connect", () => {
  console.log("Connected");
})

buttons.forEach((button, idx) => {
  let numPresses = 0;
  let timeout = null;
  button.watch((err, value) => {
    numPresses++;
  
    if (timeout === null) {
      timeout = setTimeout(() => {
        timeout = null;
  
        if (numPresses === 1) {
          socket.emit("button_press", idx + 1);
        } else if (numPresses > 1) {
          socket.emit("double_button_press", idx + 1);
        }
  
        numPresses = 0;
      }, 300);
    }
  });  
})

process.on('SIGINT', _ => {
  buttons.forEach((button) => {
    button.unexport();
  });
});
