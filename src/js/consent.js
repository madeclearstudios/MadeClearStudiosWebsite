// Cookie consent banner. Google Analytics (set up in _includes/analytics.njk) only loads after "Accept".
// The choice is kept in localStorage ("mc-consent": "granted" or "denied", with the date) for 6 months,
// then the banner asks again. Any element with [data-cookie-settings] reopens the banner.
(function () {
  var KEY = "mc-consent";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 183;
  var loaded = false;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && (v.choice === "granted" || v.choice === "denied") && Date.now() - v.at < MAX_AGE) return v.choice;
    } catch (e) {}
    return null;
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: Date.now() })); } catch (e) {}
  }

  function loadAnalytics() {
    if (loaded || !window.MC_GA_ID) return;
    loaded = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + window.MC_GA_ID;
    document.head.appendChild(s);
  }

  // Remove GA cookies left over from before the visitor said no
  function clearAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (/^_ga/.test(name) || name === "_gid") {
        ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }

  var banner;
  function build() {
    banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie choices");
    banner.innerHTML =
      '<p class="cookie-banner_text">We use Google Analytics cookies to see how people use our site, so we can improve it. ' +
      'They are only set if you accept. <a href="/privacy-policy#cookies" class="cookie-banner_link">Read our privacy policy</a>.</p>' +
      '<div class="cookie-banner_buttons">' +
      '<button type="button" class="cookie-banner_button" data-consent="denied">Reject</button>' +
      '<button type="button" class="cookie-banner_button is-accept" data-consent="granted">Accept</button>' +
      "</div>";
    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (!btn) return;
      var choice = btn.getAttribute("data-consent");
      save(choice);
      if (choice === "granted") loadAnalytics();
      else {
        clearAnalyticsCookies();
        // Analytics already running on this page can't be unloaded; reload so it stops straight away
        if (loaded) location.reload();
      }
      hide();
    });
    document.body.appendChild(banner);
  }
  function show() {
    if (!banner) build();
    banner.hidden = false;
    var first = banner.querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }
  function hide() {
    if (banner) banner.hidden = true;
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cookie-settings]")) {
      e.preventDefault();
      show();
    }
  });

  var choice = read();
  if (choice === "granted") loadAnalytics();
  else if (choice === null) {
    if (document.body) build();
    else document.addEventListener("DOMContentLoaded", build);
  }
})();
