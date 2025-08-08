const helloText = document.getElementById('hello-text');
const helloScreen = document.getElementById('hello-screen');
const desktop = document.getElementById('desktop');
const toggle = document.getElementById('theme-toggle');
const body = document.body;

helloText.addEventListener('click', () => {
  helloScreen.classList.add('hidden');
  desktop.classList.remove('hidden');
});

// toggle theme
toggle.addEventListener('change', () => {
  body.classList.toggle('night-mode');
  body.classList.toggle('day-mode');
});

// folder click to open window
document.querySelectorAll('.folder').forEach(folder => {
  folder.addEventListener('click', () => {
    const windowId = 'window-' + folder.dataset.window;
    document.getElementById(windowId).classList.remove('hidden');
  });
});

function closeWindow(id) {
  document.getElementById(`window-${id}`).classList.add('hidden');
}
