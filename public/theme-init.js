// Runs before first paint (loaded by layout.tsx with strategy "beforeInteractive").
// Applies the saved day/night choice and flags that JS is running.
// Keep the storage key in sync with src/lib/theme.ts.
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try {
    var t = localStorage.getItem("minimize:theme");
    if (t === "light" || t === "dark") d.dataset.theme = t;
  } catch {
    // Storage blocked: follow the system theme.
  }
})();
