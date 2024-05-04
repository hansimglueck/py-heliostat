document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  socket.on("solar_position", function (data) {
    document.getElementById("sun_azimuth_value").textContent =
      data.azimuth.toFixed(2);
    document.getElementById("sun_elevation_value").textContent =
      data.elevation.toFixed(2);
  });
});
