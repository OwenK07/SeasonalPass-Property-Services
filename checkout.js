"use strict";

(() => {
  const packages = {
    "spring-summer": { name: "Spring/SummerCare", rate: 0.25 },
    "year-round": { name: "Year Round Love", rate: 0.3 },
    "fall-winter": { name: "Fall/WinterShield", rate: 0.35 },
  };
  const neighborhoods = {
    "west-end": "Halifax's West End",
    "northwest-arm": "Northwest Arm",
  };
  const currency = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const params = new URLSearchParams(window.location.search);
  const packageChoice = packages[params.get("package")];
  const area = Number(params.get("area"));
  const neighborhood = neighborhoods[params.get("neighborhood")];
  const checkoutError = document.querySelector("#checkout-error");
  const checkoutContent = document.querySelector("#checkout-content");

  if (!packageChoice || !Number.isInteger(area) || area < 100 || area > 10000 || !neighborhood) {
    checkoutError.hidden = false;
    return;
  }

  const total = area * packageChoice.rate;
  document.querySelector("#checkout-package").textContent = packageChoice.name;
  document.querySelector("#checkout-area").textContent = `${area.toLocaleString("en-CA")} sq ft`;
  document.querySelector("#checkout-neighborhood").textContent = neighborhood;
  document.querySelector("#checkout-rate").textContent = `${currency.format(packageChoice.rate)} / sq ft / month`;
  document.querySelector("#checkout-total").textContent = `${currency.format(total)} per month`;

  const editParams = new URLSearchParams({
    package: params.get("package"),
    area: String(area),
    neighborhood: params.get("neighborhood"),
  });
  document.querySelector("#edit-estimate").href = `product.html?${editParams.toString()}`;
  checkoutContent.hidden = false;

  const checkoutForm = document.querySelector("#checkout-form");
  const checkoutSuccess = document.querySelector("#checkout-success");
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!checkoutForm.reportValidity()) {
      return;
    }

    checkoutForm.hidden = true;
    checkoutSuccess.textContent = "Your demo checkout is complete. No payment was taken, and your details were not sent or stored.";
    checkoutSuccess.hidden = false;
  });
})();
