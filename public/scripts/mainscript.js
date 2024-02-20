console.log("hello brogaer");

function brogaButton() {
  console.log("hello man")
  let brog = document.getElementById("broga")
  brog.innerHTML = brog.innerHTML + "aoisudhflasykdufhlkj "
}


function updateCanvas() {
  let canvas = document.getElementById("canvas")
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#EEEEEE"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

updateCanvas()
