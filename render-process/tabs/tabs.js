const TabGroup = require('./electron-tabs')
const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote
var fs = require('fs')
const axios = require('axios')
const MediumView = require('../medium-view/medium-view')
const DraftView = require('../draft-view/draft-view')

const Tabs = new TabGroup({
  newTab: {
    title: 'Untitled',
    visible: true,
    active: true,
    browserView: new DraftView().browserView,
  },
})
Tabs.addTab({
  title: '',
  iconURL: 'assets/app-icon/png/512.png',
  visible: true,
  active: true,
  browserView: new MediumView().browserView,
  closable: false,
})

function newTab (url, ready) {
  Tabs.addTab({
    title: 'Untitled',
    visible: true,
    active: true,
    browserView: new DraftView(url).browserView,
    ready: ready,
  })
}

ipcRenderer.on('open_import_dialogue', (evt, data) => {
  dialog
    .showOpenDialog({
      properties: ['openFile', 'openDirectory'],
      filters: [{ name: 'Custom File Type', extensions: ['md'] }],
    })
    .then((file) => {
      fs.readFile(file.filePaths[0], 'utf-8', (err, content) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }
        axios({
          method: 'post',
          url: `https://api.medium.com/v1/users/${data.userData.id}/posts`,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
          data: {
            title: '',
            contentFormat: 'markdown',
            content: content,
            publishStatus: 'draft',
          },
        })
          .then(function (postResponse) {
            console.log('postResponse ', postResponse)
            Tabs.addTab({
              title: 'Untitled',
              src: postResponse.data.data.url,
              visible: true,
              active: true,
              closable: true,
            })
          })
          .catch(function (error) {
            console.log(error)
          })
      })
    })
    .catch((e) => {
      console.log('error in fetching file ', e)
    })
})

module.exports = { newTab }
