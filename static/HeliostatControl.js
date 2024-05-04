document.addEventListener("DOMContentLoaded", function () {
  const socket = io();

  socket.on("update_heliostat", function (data) {
    document.getElementById("heliostat_azimuth_value").textContent =
      data.azimuth.toFixed(2);
    document.getElementById("heliostat_elevation_value").textContent =
      data.elevation.toFixed(2);
  });

  document.querySelectorAll(".direction-btn").forEach((button) => {
    button.addEventListener("click", function () {
      socket.emit("change_direction", {
        direction: this.getAttribute("data-direction"),
        step: document
          .getElementById("step-size-value")
          .textContent.split(" ")[0], // Extract the numeric part
      });
    });
  });
});
