function openOptions() {
  var opening = (window.browser || window.chrome).runtime.openOptionsPage();
  opening.catch(err => {
    console.log(`Error: ${error}`);
  });
}

window.onload = function() {
  document.getElementById('openOptionsLink').onclick = function(e) {
    openOptions();
    return false;
  }
}
