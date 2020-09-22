(function () {
      
      const remote = require('electron').remote; 
const { ipcRenderer } = require("electron");

      
      function init() { 
        document.getElementById("menu-btn").addEventListener("click", function (e) {
         console.log("Menu bar icon clicked");
          let x = e.x;
          let y = e.y;
         ipcRenderer.send(`display-app-menu`, { x, y });
        });
        document.getElementById("min-btn").addEventListener("click", function (e) {
          const window = remote.getCurrentWindow();
          window.minimize(); 
        });
        
        document.getElementById("max-btn").addEventListener("click", function (e) {
          const window = remote.getCurrentWindow();
          if (!window.isMaximized()) {
            window.maximize();
          } else {
            window.unmaximize();
          }	 
        });
        
        document.getElementById("close-btn").addEventListener("click", function (e) {
          const window = remote.getCurrentWindow();
          window.close();
        }); 
      }; 
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
})();