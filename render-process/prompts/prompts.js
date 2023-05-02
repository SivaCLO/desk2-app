const { ipcRenderer } = require('electron');
const { log } = require('../../common/activity');

window.addEventListener(
  'keyup',
  (e) => {
    if (e.code === 'Escape') {
      ipcRenderer.send('close-prompts-window');
    }
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      arrowUpOrDownSelector(e.code);
    }
    if (e.code === 'Enter') {
      let activeElement = document.getElementsByClassName('active').item(0);
      activeElement.click();
    }
  },
  true
);

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.action) {
    handleAction(event);
  }
});

async function handleAction(event) {
  let action = event.target.dataset.action;
  if (action === 'hello') {
    log('prompts/hello');
    ipcRenderer.send('send-prompt', 'hello');
  } else if (action === 'generateTitle') {
    log('prompts/generateTitle');
    ipcRenderer.send('send-prompt', 'generateTitle');
  } else if (action === 'cancel') {
    log('prompts/cancel');
  }
  ipcRenderer.send('close-prompts-window');
}

function arrowUpOrDownSelector(keyEvent) {
  let listOfItems,
    i,
    tempArray = [],
    arrayElementIndex,
    activeElementPosition = null;
  listOfItems = document.getElementById('prompt-list').childNodes;

  for (i = 0; i < listOfItems.length - 1; i++) {
    if (listOfItems[i].nodeName === 'A') {
      if (listOfItems[i].classList.value.includes('prompt-item')) tempArray.push(i);
      if (listOfItems[i].classList.value.includes('active')) {
        activeElementPosition = i;
      }
    }
  }

  arrayElementIndex = tempArray.indexOf(activeElementPosition);

  if (keyEvent === 'ArrowUp' && arrayElementIndex !== 0) {
    listOfItems[activeElementPosition].classList.remove('active');
    listOfItems[tempArray[arrayElementIndex - 1]].classList.add('active');
  }

  if (keyEvent === 'ArrowDown' && tempArray.length - 1 !== arrayElementIndex) {
    listOfItems[activeElementPosition].classList.remove('active');
    listOfItems[tempArray[arrayElementIndex + 1]].classList.add('active');
  }
}
