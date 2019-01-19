window.addEventListener("DOMContentLoaded", async function () {
  const previewEl = document.getElementById("preview");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  previewEl.srcObject = stream;
  previewEl.onloadedmetadata = () => {
    previewEl.play();
  };
}, false);
