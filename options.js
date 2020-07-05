function save_options() {
  const flow = document.getElementById('flow').value;
  chrome.storage.sync.set(
    {
      selectedFlow: flow,
    },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Flow saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 1500);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get('selectedFlow', options => {
    document.getElementById('flow').value = options.selectedFlow | 'simple';
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
