function save_options() {
  const selectedFlow = document.getElementById("flow").value;
  const copyWithCommand = document.getElementById("copy-with-command").checked;
  const regexpExclude = {
    pattern: document.getElementById("regexp-exclude-pattern").value,
    flag: document.getElementById("regexp-exclude-flag").value,
  };
  const registry = {
    key: document.getElementById("key-registry").value,
    name: document.getElementById("name-registry").value,
  };
  chrome.storage.sync.set(
    {
      selectedFlow,
      copyWithCommand,
      regexpExclude,
      registry,
    },
    () => {
      const save = document.getElementById("save");
      save.textContent = "Option saved";
      setTimeout(() => {
        save.textContent = "Save";
      }, 3500);
    }
  );
}

function restore_options() {
  chrome.storage.sync.get(
    ["selectedFlow", "copyWithCommand", "regexpExclude", "registry"],
    (options) => {
      document.getElementById("flow").value = options.selectedFlow || "simple";
      document.getElementById("copy-with-command").checked =
        options.copyWithCommand || false;
      document.getElementById("regexp-exclude-pattern").value =
        (options.regexpExclude && options.regexpExclude.pattern) || "";
      document.getElementById("regexp-exclude-flag").value =
        (options.regexpExclude && options.regexpExclude.flag) || "";
      document.getElementById("key-registry").value =
        (options.registry && options.registry.key) || "default";
      document.getElementById("name-registry").value =
        (options.registry && options.registry.name) || "default";
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
