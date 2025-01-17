const EventEmitter = require('events');
const Remote = require('@electron/remote');
const { ipcRenderer } = require('electron');
const AppTab = require('./app-tab');
const { log } = require('../../common/activity');
const FindInPage = require('electron-find').FindInPage;
let findInPage = null;

if (!document) {
  throw Error('electron-tabs module must be called in renderer process');
}

class TabGroup extends EventEmitter {
  constructor(args = {}) {
    super();
    let options = (this.options = {
      tabContainerSelector: args.tabContainerSelector || '.etabs-tabs',
      buttonsContainerSelector: args.buttonsContainerSelector || '.etabs-buttons',
      tabClass: args.tabClass || 'etabs-tab',
      closeButtonText: args.closeButtonText || '&#215;',
      newTab: args.newTab,
      newTabButtonText: args.newTabButtonText || '&#65291;',
      visibilityThreshold: args.visibilityThreshold || 0,
      ready: args.ready,
    });
    this.tabContainer = document.querySelector(options.tabContainerSelector);
    this.tabs = [];
    this.closedTabs = [];
    this.newTabId = 0;
    TabGroupPrivate.initNewTabButton.bind(this)();
    TabGroupPrivate.initVisibility.bind(this)();
    if (typeof this.options.ready === 'function') {
      this.options.ready(this);
    }
  }

  addTab(args = this.options.newTab) {
    if (typeof args === 'function') {
      args = args(this);
    }
    let id = this.newTabId;
    log('electron-tabs/add-tab', { id, args });
    this.newTabId++;
    let tab = new Tab(this, id, args);
    this.tabs.push(tab);
    // Don't call tab.activate() before a tab is referenced in this.tabs
    if (args.active === true) {
      tab.activate();
    }
    this.emit('tab-added', tab, this);
    this.resizeTabs();
    return tab;
  }

  resizeTabs() {
    let windowWidth = Remote.getCurrentWindow().getBounds().width;
    let numberOfTabs = this.tabs.length;
    if (numberOfTabs > 0) {
      let maxWidth = (windowWidth - 115) / numberOfTabs;
      if (maxWidth < 120) {
        this.setTabWidth(maxWidth);
      } else {
        this.setTabWidth(120);
      }
    }
  }

  setTabWidth(width) {
    let all = document.getElementsByClassName('etabs-tab');
    for (let i = 0; i < all.length; i++) {
      all[i].style.width = width + 'px';
    }
  }

  getTab(id) {
    for (let i in this.tabs) {
      if (this.tabs[i].id === id) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByPosition(position) {
    let fromRight = position < 0;
    for (let i in this.tabs) {
      if (this.tabs[i].getPosition(fromRight) === position) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByRelPosition(position) {
    position = this.getActiveTab().getPosition() + position;
    if (position <= 0) {
      position = this.tabs.length;
    } else if (position > this.tabs.length) {
      position = 1;
    }
    return this.getTabByPosition(position);
  }

  getNextTab() {
    return this.getTabByRelPosition(1);
  }

  getPreviousTab() {
    return this.getTabByRelPosition(-1);
  }

  getTabs() {
    return this.tabs.slice();
  }

  eachTab(fn) {
    this.getTabs().forEach(fn);
    return this;
  }

  getActiveTab() {
    if (this.tabs.length === 0) return null;
    return this.tabs[0];
  }
}

const TabGroupPrivate = {
  initNewTabButton: function () {
    if (!this.options.newTab) return;
    let container = document.querySelector(this.options.buttonsContainerSelector);
    let button = container.appendChild(document.createElement('button'));
    button.classList.add(`${this.options.tabClass}-button-new`);
    button.innerHTML = this.options.newTabButtonText;
    button.addEventListener(
      'click',
      (() => {
        log('electron-tabs/new-tab-button');
        this.addTab();
      }).bind(this),
      false
    );
  },

  initVisibility: function () {
    function toggleTabsVisibility(tab, tabGroup) {
      var visibilityThreshold = this.options.visibilityThreshold;
      var el = tabGroup.tabContainer.parentNode;
      if (this.tabs.length >= visibilityThreshold) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    }

    this.on('tab-added', toggleTabsVisibility);
    this.on('tab-removed', toggleTabsVisibility);
  },

  removeTab: function (tab, triggerEvent) {
    let id = tab.id;
    for (let i in this.tabs) {
      if (this.tabs[i].id === id) {
        this.tabs.splice(i, 1);
        break;
      }
    }
    if (triggerEvent) {
      this.emit('tab-removed', tab, this);
    }
    return this;
  },

  setActiveTab: function (tab) {
    TabGroupPrivate.removeTab.bind(this)(tab);
    this.tabs.unshift(tab);
    this.emit('tab-active', tab, this);
    return this;
  },

  activateRecentTab: function (tab) {
    if (this.tabs.length > 0) {
      this.tabs[0].activate();
    }
    return this;
  },
};

class Tab extends EventEmitter {
  constructor(tabGroup, id, args) {
    super();
    this.tabGroup = tabGroup;
    this.id = id;
    this.title = args.title;
    this.badge = args.badge;
    this.iconURL = args.iconURL;
    this.icon = args.icon;
    this.closable = args.closable !== false;
    this.tabElements = {};
    TabPrivate.initTab.bind(this)();
    this.url = args.url;
    this.view = new AppTab(this.url, this, tabGroup);
    if (args.visible !== false) {
      this.show();
    }
    if (typeof args.ready === 'function') {
      args.ready(this);
    }
  }

  setTitle(title) {
    if (this.isClosed) return;
    let span = this.tabElements.title;
    span.innerHTML = title;
    span.title = title;
    span.classList.remove('hidden');
    this.title = title;
    this.emit('title-changed', title, this);
    return this;
  }

  getTitle() {
    if (this.isClosed) return;
    return this.title;
  }

  setBadge(badge) {
    if (this.isClosed) return;
    let span = this.tabElements.badge;
    this.badge = badge;

    if (badge) {
      span.innerHTML = badge;
      span.classList.remove('hidden');
    } else {
      span.classList.add('hidden');
    }

    this.emit('badge-changed', badge, this);
  }

  getBadge() {
    if (this.isClosed) return;
    return this.badge;
  }

  setIcon(iconURL, icon, iconSVG) {
    if (this.isClosed) return;
    this.iconURL = iconURL;
    this.icon = icon;
    let span = this.tabElements.icon;
    if (iconURL) {
      span.innerHTML = `<img src="${iconURL}" />`;
      this.emit('icon-changed', iconURL, this);
    } else if (icon) {
      span.innerHTML = `<i class="${icon}"></i>`;
      this.emit('icon-changed', icon, this);
    } else if (iconSVG) {
      span.innerHTML = `<svg class="bi">${iconSVG}</svg>`;
      this.emit('icon-changed', iconSVG, this);
    } else {
      span.innerHTML = ``;
      this.emit('icon-changed', null, this);
    }

    return this;
  }

  getIcon() {
    if (this.isClosed) return;
    if (this.iconURL) return this.iconURL;
    return this.icon;
  }

  setPosition(newPosition) {
    let tabContainer = this.tabGroup.tabContainer;
    let tabs = tabContainer.children;
    let oldPosition = this.getPosition() - 1;

    if (newPosition < 0) {
      newPosition += tabContainer.childElementCount;

      if (newPosition < 0) {
        newPosition = 0;
      }
    } else {
      if (newPosition > tabContainer.childElementCount) {
        newPosition = tabContainer.childElementCount;
      }

      // Make 1 be leftmost position
      newPosition--;
    }

    if (newPosition > oldPosition) {
      newPosition++;
    }

    tabContainer.insertBefore(tabs[oldPosition], tabs[newPosition]);

    return this;
  }

  getPosition(fromRight) {
    let position = 0;
    let tab = this.tab;
    while ((tab = tab.previousSibling) != null) position++;

    if (fromRight === true) {
      position -= this.tabGroup.tabContainer.childElementCount;
    }

    if (position >= 0) {
      position++;
    }

    return position;
  }

  activate() {
    if (this.isClosed) return;

    log('electron-tabs/activate-tab', { id: this.id, url: this.url, title: this.getTitle() });

    // Deactivate previous Tab
    let activeTab = this.tabGroup.getActiveTab();
    if (activeTab) {
      activeTab.tab.classList.remove('active');
      activeTab.emit('inactive', activeTab);
    }

    // Activate Tab
    TabGroupPrivate.setActiveTab.bind(this.tabGroup)(this);
    this.tab.classList.add('active');

    this.view.activateTab();

    // Activate View
    Remote.getCurrentWindow().setBrowserView(this.view.browserView);

    this.view.browserView.setBounds({
      x: 0,
      y: 82,
      width: Remote.getCurrentWindow().getContentBounds().width,
      height: Remote.getCurrentWindow().getContentBounds().height - 80,
    });
    this.view.browserView.webContents.focus();

    this.emit('active', this);
    destroyFindInPage();
    return this;
  }

  show(flag) {
    if (this.isClosed) return;
    if (flag !== false) {
      this.tab.classList.add('visible');
      this.emit('visible', this);
    } else {
      this.tab.classList.remove('visible');
      this.emit('hidden', this);
    }
    return this;
  }

  hide() {
    return this.show(false);
  }

  flash(flag) {
    if (this.isClosed) return;
    if (flag !== false) {
      this.tab.classList.add('flash');
      this.emit('flash', this);
    } else {
      this.tab.classList.remove('flash');
      this.emit('unflash', this);
    }
    return this;
  }

  unflash() {
    return this.flash(false);
  }

  hasClass(classname) {
    return this.tab.classList.contains(classname);
  }

  close(force) {
    log('electron-tabs/close-tab', { id: this.id, url: this.url, title: this.getTitle() });
    const abortController = new AbortController();
    const abort = () => abortController.abort();
    this.emit('closing', this, abort);

    const abortSignal = abortController.signal;
    if (this.isClosed || (!this.closable && !force) || abortSignal.aborted) return;

    this.isClosed = true;
    let tabGroup = this.tabGroup;
    tabGroup.tabContainer.removeChild(this.tab);
    if (this.url) {
      this.tabGroup.closedTabs.push(this.url);
    }
    ipcRenderer.send('delete-tab', { id: this.id });

    let activeTab = this.tabGroup.getActiveTab();
    TabGroupPrivate.removeTab.bind(tabGroup)(this, true);

    this.emit('close', this);

    if (this.tabGroup.tabs.length === 0) {
      ipcRenderer.send('close-main-window');
    }

    this.tabGroup.resizeTabs();
    if (activeTab.id === this.id) {
      TabGroupPrivate.activateRecentTab.bind(tabGroup)();
    }
  }
}

const TabPrivate = {
  initTab: function () {
    let tabClass = this.tabGroup.options.tabClass;

    // Create tab element
    let tab = (this.tab = document.createElement('div'));
    tab.classList.add(tabClass);
    for (let el of ['icon', 'title', 'buttons', 'badge']) {
      let span = tab.appendChild(document.createElement('span'));
      span.classList.add(`${tabClass}-${el}`);
      this.tabElements[el] = span;
    }

    this.setTitle(this.title);
    this.setBadge(this.badge);
    this.setIcon(this.iconURL, this.icon);
    TabPrivate.initTabButtons.bind(this)();
    TabPrivate.initTabClickHandler.bind(this)();

    this.tabGroup.tabContainer.appendChild(this.tab);
  },

  initTabButtons: function () {
    let container = this.tabElements.buttons;
    let tabClass = this.tabGroup.options.tabClass;
    if (this.closable) {
      container.classList.remove('hidden');
      let button = container.appendChild(document.createElement('button'));
      button.classList.add(`${tabClass}-button-close`);
      button.innerHTML = this.tabGroup.options.closeButtonText;
      button.addEventListener('click', this.close.bind(this, false), false);
    } else {
      container.classList.add('hidden');
    }
  },

  initTabClickHandler: function () {
    // Mouse up
    const tabClickHandler = function (e) {
      if (this.isClosed) return;
      if (e.which === 2) {
        this.close();
      }
    };
    this.tab.addEventListener('mouseup', tabClickHandler.bind(this), false);
    // Mouse down
    const tabMouseDownHandler = function (e) {
      if (this.isClosed) return;
      if (e.which === 1) {
        if (e.target.matches('button')) return;
        this.activate();
      }
    };
    this.tab.addEventListener('mousedown', tabMouseDownHandler.bind(this), false);
  },
};

ipcRenderer.on('on-find', (e, args) => {
  if (findInPage) {
    findInPage.destroy();
  }
  findInPage = new FindInPage(Remote.getCurrentWindow().getBrowserView().webContents, {
    preload: true,
    parentElement: document.querySelector('.toolbar.active'),
    offsetTop: 40,
  });
  setTimeout(() => {
    let elements = document.getElementsByClassName('find-box')[0].children;
    elements[0].focus();
  }, 500);
  findInPage.openFindWindow();
});

function destroyFindInPage() {
  if (findInPage) {
    findInPage.destroy();
    findInPage = null;
  }
}

module.exports = TabGroup;
