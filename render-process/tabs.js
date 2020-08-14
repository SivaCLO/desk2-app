const TabGroup = require('./electron-tabs')

const Tabs = new TabGroup({
  newTab: {
    title: 'Untitled',
    src: 'https://medium.com/new-story',
    visible: true,
    active: true
  }
})

Tabs.addTab({
  title: '',
  src: 'https://medium.com/me/stories/drafts',
  iconURL: "assets/app-icon/png/512.png",
  visible: true,
  active: true,
  closable: false
})