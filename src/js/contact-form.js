// Sends each enquiry form to Netlify Forms and shows the Webflow success/error message.
(function () {
  document.querySelectorAll(".netlify-form").forEach(function (wrap) {
    var form = wrap.querySelector("form");
    var done = wrap.querySelector(".w-form-done");
    var fail = wrap.querySelector(".w-form-fail");
    var button = form.querySelector('input[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var label = button.value;
      button.value = button.getAttribute("data-wait") || "Please wait...";
      button.disabled = true;
      fail.style.display = "none";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.style.display = "none";
          done.style.display = "block";
          // Count the enquiry in Google Analytics (GA4 "generate_lead" event). Only sent if the visitor accepted cookies.
          if (typeof window.gtag === "function") {
            window.gtag("event", "generate_lead", {
              form_name: form.getAttribute("name") || "contact",
              form_location: location.pathname,
            });
          }
        })
        .catch(function () {
          fail.style.display = "block";
        })
        .finally(function () {
          button.value = label;
          button.disabled = false;
        });
    });
  });
})();
