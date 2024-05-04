document.addEventListener("DOMContentLoaded", function () {
  const stepSizes = [0.01, 0.1, 1, 10];
  let currentStepIndex = 2; // Startet bei 1, was '1 Grad' entspricht

  const stepValueDisplay = document.getElementById("step-size-value");
  const increaseButton = document.getElementById("increase-step");
  const decreaseButton = document.getElementById("decrease-step");

  function updateStepSizeDisplay() {
    stepValueDisplay.textContent =
      stepSizes[currentStepIndex].toFixed(2) + " °";
  }

  increaseButton.addEventListener("click", function () {
    if (currentStepIndex < stepSizes.length - 1) {
      currentStepIndex++;
      updateStepSizeDisplay();
    }
  });

  decreaseButton.addEventListener("click", function () {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      updateStepSizeDisplay();
    }
  });

  updateStepSizeDisplay();
});
