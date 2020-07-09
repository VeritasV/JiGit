function save_options() {
  const selectedFlow = document.getElementById("flow").value;
  const copyWithCommand = document.getElementById("copy-with-command").checked;
  const regexpExclude = {
    pattern: document.getElementById("regexp-exclude-pattern").value,
    flag: document.getElementById("regexp-exclude-flag").value,
  };
  const keyRegistry = document.getElementById("key-registry").value;
  chrome.storage.sync.set(
    {
      selectedFlow,
      copyWithCommand,
      regexpExclude,
      keyRegistry,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Option saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 1500);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get(
    ["selectedFlow", "copyWithCommand", "regexpExclude", "keyRegistry"],
    (options) => {
      document.getElementById("flow").value = options.selectedFlow || "simple";
      document.getElementById("copy-with-command").checked =
        options.copyWithCommand || false;
      document.getElementById("regexp-exclude-pattern").value =
        options.regexpExclude.pattern || "";
      document.getElementById("regexp-exclude-flag").value =
        options.regexpExclude.flag || "";
      document.getElementById("key-registry").value =
        options.keyRegistry || "uppercase";
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
