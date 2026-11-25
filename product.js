"use strict";

(() => {
  const MIN_AREA = 100;
  const MAX_AREA = 10000;
  const currency = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const packageInputs = [...document.querySelectorAll('input[name="package"]')];
  const areaInput = document.querySelector("#care-area");
  const areaSlider = document.querySelector("#care-area-slider");
  const neighborhoodInput = document.querySelector("#neighborhood");
  const areaError = document.querySelector("#area-error");
  const monthlyTotal = document.querySelector("#monthly-total");
  const confirmButton = document.querySelector("#confirm-selection");
  const modal = document.querySelector("#confirmation-modal");

  const neighborhoodNames = {
    "west-end": "Halifax's West End",
    "northwest-arm": "Northwest Arm",
  };

  function selectedPackage() {
    const selected = packageInputs.find((input) => input.checked);
    if (!selected) {
      return null;
    }

    const rate = Number(selected.dataset.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      return null;
    }

    return {
      name: selected.dataset.name,
      rate,
    };
  }

  function readArea() {
    const rawValue = areaInput.value.trim();
    if (rawValue === "") {
      return null;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    if (parsed < MIN_AREA || parsed > MAX_AREA) {
      return null;
    }

    return Math.round(parsed);
  }

  function currentSelection() {
    const packageChoice = selectedPackage();
    const area = readArea();
    const neighborhood = neighborhoodNames[neighborhoodInput.value];
    if (!packageChoice || area === null || !neighborhood) {
      return null;
    }

    return {
      packageName: packageChoice.name,
      rate: packageChoice.rate,
      area,
      neighborhood,
      total: area * packageChoice.rate,
    };
  }

  function updateEstimate() {
    const selection = currentSelection();
    if (!selection) {
      monthlyTotal.textContent = "—";
      areaError.textContent = "Enter a care area between 100 and 10,000 sq ft.";
      areaInput.setAttribute("aria-invalid", "true");
      confirmButton.disabled = true;
      return;
    }

    areaError.textContent = "";
    areaInput.removeAttribute("aria-invalid");
    confirmButton.disabled = false;
    areaInput.value = String(selection.area);
    areaSlider.value = String(selection.area);
    monthlyTotal.textContent = currency.format(selection.total);
    document.querySelector("#estimate-package").textContent = selection.packageName;
    document.querySelector("#estimate-area").textContent = `${selection.area.toLocaleString("en-CA")} sq ft`;
    document.querySelector("#estimate-neighborhood").textContent = selection.neighborhood;
    document.querySelector("#estimate-rate").textContent = `${currency.format(selection.rate)} / sq ft / month`;
  }

  function openConfirmation() {
    const selection = currentSelection();
    if (!selection) {
      updateEstimate();
      return;
    }

    document.querySelector("#modal-total").textContent = `${currency.format(selection.total)} per month`;
    document.querySelector("#modal-package").textContent = selection.packageName;
    document.querySelector("#modal-area").textContent = `${selection.area.toLocaleString("en-CA")} sq ft`;
    document.querySelector("#modal-neighborhood").textContent = selection.neighborhood;
    document.querySelector("#modal-rate").textContent = `${currency.format(selection.rate)} / sq ft / month`;
    modal.showModal();
  }

  function applyPackageFromQuery() {
    const requestedPackage = new URLSearchParams(window.location.search).get("package");
    if (!requestedPackage) {
      return;
    }

    const matchingInput = packageInputs.find((input) => input.value === requestedPackage);
    if (matchingInput) {
      matchingInput.checked = true;
    }
  }

  applyPackageFromQuery();

  for (const input of packageInputs) {
    input.addEventListener("change", updateEstimate);
  }

  areaSlider.addEventListener("input", () => {
    areaInput.value = areaSlider.value;
    updateEstimate();
  });

  areaInput.addEventListener("input", updateEstimate);
  areaInput.addEventListener("change", () => {
    const area = readArea();
    if (area !== null) {
      areaInput.value = String(area);
      areaSlider.value = String(area);
    } else {
      areaInput.value = areaSlider.value;
    }
    updateEstimate();
  });

  neighborhoodInput.addEventListener("change", updateEstimate);
  confirmButton.addEventListener("click", openConfirmation);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });

  updateEstimate();
})();
