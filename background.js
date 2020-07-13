chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    runSettingApp();
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "get_issue_name" });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.activeIcon === true) {
    addActiveState(sender.tab.id);
  }
  if (msg.doneIcon === true) {
    addDoneState(sender.tab.id);
    setTimeout(() => addActiveState(sender.tab.id), 2000);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    if (
      changeInfo.url.match(
        /(?=.*(\.atlassian\.net\/jira|jira.*))(?=.*\?selectedIssue\=).*|(.atlassian.net|jira.*)\/browse/g
      )
    ) {
      addActiveState(tabId);
    } else {
      removeActiveState(tabId);
    }
  }
});

function addActiveState(tabId) {
  chrome.browserAction.setIcon({ tabId, path: "icon32-on.png" });
  chrome.browserAction.setTitle({
    title: "Click to copy issue name :)",
    tabId,
  });
}

function addDoneState(tabId) {
  chrome.browserAction.setIcon({ tabId, path: "icon32-done.png" });
  chrome.browserAction.setTitle({
    title: "Success :)",
    tabId,
  });
}

function removeActiveState(tabId) {
  chrome.browserAction.setIcon({ tabId, path: "icon32-off.png" });
  chrome.browserAction.setTitle({
    title: "Work only with jira issue pages",
    tabId,
  });
}

function runSettingApp() {
  chrome.tabs.create({ url: "options.html" });
}
