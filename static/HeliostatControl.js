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

  function updateField(elementId) {
    let element = document.getElementById(elementId);
    let currentValue = element.innerText;
    let input = document.createElement("input");
    input.type = "text";
    input.id = elementId + "_input"; // Setze die ID für das Input, basierend auf dem Element
    input.value = currentValue;
    input.style.width = "100px"; // Optional: Anpassen der Breite

    element.parentNode.replaceChild(input, element);
    input.focus();

    input.addEventListener("blur", function () {
      element.innerText = currentValue; // Setze den alten Wert zurück bei Abbruch
      input.replaceWith(element);
    });

    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        let data = {};
        data[elementId] = parseFloat(input.value);
        socket.emit("update_offset", data);

        element.innerText = input.value;
        input.replaceWith(element);
      }
    });
  }

  document.querySelectorAll(".editable").forEach((element) => {
    element.addEventListener("click", function () {
      updateField(this.id);
    });
  });

  socket.on("update_response", function (data) {
    if (data.azimuth_offset !== undefined) {
      document.getElementById("azimuth_offset").innerText = data.azimuth_offset;
    }
    if (data.elevation_offset !== undefined) {
      document.getElementById("elevation_offset").innerText =
        data.elevation_offset;
    }
  });
});
