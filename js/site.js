/*
  FRONT DOOR: SITE SCRIPT
  1. Loads a property file (properties/mesa.js by default,
     or another one with ?property=harbor in the address bar)
  2. Fills the page with that property's content
  3. Makes the search, tour picker, pricing and map work

  Nothing in here is specific to one property.
*/

// ---------- 1. Load the property file ----------

var DEFAULT_PROPERTY = "mesa";

function loadProperty(id) {
  // Only allow simple names like "harbor", never paths like "../secret"
  if (!/^[a-z0-9_]+$/.test(id)) id = DEFAULT_PROPERTY;

  var script = document.createElement("script");
  script.src = "properties/" + id + ".js";
  script.onload = function () { $(function () { buildSite(window.PROPERTY); }); };
  script.onerror = function () {
    // Typo or missing file: show the default property instead of a blank page
    console.warn('Property "' + id + '" not found. Showing "' + DEFAULT_PROPERTY + '" instead.');
    if (id !== DEFAULT_PROPERTY) loadProperty(DEFAULT_PROPERTY);
  };
  document.head.appendChild(script);
}

loadProperty(new URLSearchParams(location.search).get("property") || DEFAULT_PROPERTY);


// ---------- 2. Build the page ----------

function buildSite(p) {
  document.documentElement.setAttribute("data-theme", p.theme);
  document.title = p.name + " | Apartments in " + titleCase(p.location);

  fillFields(p);
  fillIcons();
  fillPhotos(p.photos);
  fillContactLinks(p.phone);

  buildFacts(p.facts);
  setupSearchAndPlans(p.floorPlans);
  setupTourPicker(p.tour);
  setupPricing(p.floorPlans, p.fees);
  buildAmenities(p.amenities);
  setupNeighborhood(p.neighborhood);
}

// Puts text into every element with data-field="some.path"
function fillFields(p) {
  $("[data-field]").each(function () {
    var path = $(this).data("field").split(".");
    var value = path.reduce(function (obj, key) { return obj && obj[key]; }, p);
    $(this).text(value || "");
  });
}

// Shows the photo, or a labeled placeholder if there is no photo yet
function fillPhotos(photos) {
  $(".js-photo").each(function () {
    var photo = photos[$(this).data("photo")];
    if (photo.src) {
      $(this).css("background-image", "url(" + photo.src + ")").attr({ role: "img", "aria-label": photo.label });
    } else {
      $(this).html('<span class="photo-label">Photo: ' + escapeHtml(photo.label) + "</span>");
    }
  });
}

function fillContactLinks(phone) {
  var digits = "+1" + phone.replace(/\D/g, "");
  $(".js-phone").attr("href", "tel:" + digits);
  $(".js-sms").attr("href", "sms:" + digits);
}

function buildFacts(facts) {
  var html = facts.map(function (f) {
    return '<li class="fact">' + icon(f.icon) +
      "<div><strong>" + escapeHtml(f.title) + "</strong><span>" + escapeHtml(f.text) + "</span></div></li>";
  });
  $("#factList").html(html.join(""));
}

function buildAmenities(amenities) {
  var html = amenities.map(function (a) {
    return "<li><strong>" + escapeHtml(a.title) + "</strong><span>" + escapeHtml(a.text) + "</span></li>";
  });
  $("#amenityList").html(html.join(""));
}


// ---------- 3a. Search bar + floor plans ----------

function setupSearchAndPlans(plans) {
  var selectedBeds = null;   // null means "any"

  // One button per bedroom count that exists in the floor plans
  var bedCounts = unique(plans.map(function (plan) { return plan.beds; }));
  $("#bedButtonList").html(bedCounts.map(function (beds) {
    return '<button type="button" class="choice" aria-pressed="false" data-beds="' + beds + '">' + bedLabel(beds) + "</button>";
  }).join(""));

  // Max rent options in $500 steps, from the cheapest plan up to the priciest
  var rents = plans.map(function (plan) { return plan.rent; });
  var step = 500;
  var options = ['<option value="Infinity">No max</option>'];
  for (var max = Math.ceil(Math.min.apply(null, rents) / step) * step; max < Math.max.apply(null, rents); max += step) {
    options.push('<option value="' + max + '">' + money(max) + "</option>");
  }
  $("#maxRent").html(options.join(""));

  function matchingPlans() {
    var maxRent = Number($("#maxRent").val());
    return plans.filter(function (plan) {
      return (selectedBeds === null || plan.beds === selectedBeds) && plan.rent <= maxRent;
    });
  }

  function render() {
    var list = matchingPlans();
    var homesOpen = list.reduce(function (sum, plan) { return sum + plan.available; }, 0);

    $("#planList").html(list.map(planCard).join(""));
    $("#planCount").text(list.length + " of " + plans.length + " floor plans");
    $("#searchButton").text(homesOpen ? "Show " + homesOpen + " homes" : "No homes match");
  }

  $("#bedButtonList").on("click", ".choice", function () {
    var beds = Number($(this).data("beds"));
    selectedBeds = (selectedBeds === beds) ? null : beds;   // tap again to clear
    $("#bedButtonList .choice").attr("aria-pressed", "false");
    if (selectedBeds !== null) $(this).attr("aria-pressed", "true");
    render();
  });

  $("#maxRent").on("change", render);

  $("#searchForm").on("submit", function (event) {
    event.preventDefault();
    document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
  });

  render();
}

function planCard(plan) {
  var badge = plan.available === 0
    ? '<span class="badge badge-wait">Next opening ' + escapeHtml(plan.availableOn) + "</span>"
    : plan.availableOn === "now"
      ? '<span class="badge">' + plan.available + " available now</span>"
      : '<span class="badge badge-soon">' + plan.available + " available " + escapeHtml(plan.availableOn) + "</span>";

  return (
    '<article class="card plan-card">' +
      '<div class="plan-drawing">' + icon("floorplan") + "</div>" +
      '<div class="plan-body">' +
        '<div class="plan-top"><h3>' + escapeHtml(plan.name) + "</h3>" +
        '<span class="plan-rent">' + money(plan.rent) + "<small>/mo</small></span></div>" +
        '<p class="plan-specs">' + bedLabel(plan.beds) + " · " + plan.baths + " bath · " + plan.sqft.toLocaleString() + " sq ft</p>" +
        badge +
      "</div>" +
    "</article>"
  );
}


// ---------- 3b. Tour picker ----------

function setupTourPicker(tour) {
  var choice = { type: 0, day: 0, time: null };

  // Tour type buttons
  $("#tourTypeList").html(tour.types.map(function (t, i) {
    return '<button type="button" aria-pressed="' + (i === 0) + '" data-index="' + i + '">' + escapeHtml(t.label) + "</button>";
  }).join(""));

  // The next five days, starting today
  var days = [];
  for (var i = 0; i < 5; i++) {
    var d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  $("#dayList").html(days.map(function (d, i) {
    var name = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    var full = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    // The full date is extra text for screen readers. The visible "Tue 27" stays
    // in the button's name so voice control users can say what they see (WCAG 2.5.3).
    return '<button type="button" aria-pressed="' + (i === 0) + '" data-index="' + i + '">' +
      "<small>" + name + "</small><strong>" + d.getDate() + "</strong>" +
      '<span class="visually-hidden">, ' + full + "</span></button>";
  }).join(""));

  function renderTimes() {
    var type = tour.types[choice.type];
    $("#tourNote").text(type.note);

    // For today, only show times that have not passed yet
    var now = new Date();
    var minutesNow = now.getHours() * 60 + now.getMinutes();
    var times = type.times.filter(function (time) {
      return choice.day !== 0 || toMinutes(time) > minutesNow;
    });

    if (times.length === 0) {
      $("#timeList").html('<p class="small-note">No times left today. Pick another day.</p>');
    } else {
      $("#timeList").html(times.map(function (time) {
        return '<button type="button" aria-pressed="false">' + time + "</button>";
      }).join(""));
    }
    choice.time = null;
    updateSubmit();
  }

  function updateSubmit() {
    var dayText = choice.day === 0 ? "today" : days[choice.day].toLocaleDateString("en-US", { weekday: "long" });
    $("#tourSubmit")
      .prop("disabled", !choice.time)
      .text(choice.time ? "Continue with " + dayText + " at " + choice.time : "Pick a time");
    $("#tourDone").text("");
  }

  function pressOnly(group, button) {
    $(group).find("button").attr("aria-pressed", "false");
    $(button).attr("aria-pressed", "true");
  }

  $("#tourTypeList").on("click", "button", function () {
    pressOnly("#tourTypeList", this);
    choice.type = Number($(this).data("index"));
    renderTimes();
  });
  $("#dayList").on("click", "button", function () {
    pressOnly("#dayList", this);
    choice.day = Number($(this).data("index"));
    renderTimes();   // times depend on the day
  });
  $("#timeList").on("click", "button", function () {
    pressOnly("#timeList", this);
    choice.time = $(this).text();
    updateSubmit();
  });
  $("#tourForm").on("submit", function (event) {
    event.preventDefault();
    $("#tourDone").text("Request received. We will text you a confirmation.");
  });

  renderTimes();
}


// ---------- 3c. Pricing calculator ----------

function setupPricing(plans, fees) {
  // Only plans you can actually rent go in the dropdown
  var rentable = plans.filter(function (plan) { return plan.available > 0; });
  $("#pricePlan").html(rentable.map(function (plan, i) {
    return '<option value="' + i + '">' + escapeHtml(plan.name) + ", " + bedLabel(plan.beds) + ", " + money(plan.rent) + "</option>";
  }).join(""));

  // A checkbox for each optional fee
  $("#feeOptionList").html(fees.monthly.map(function (fee, i) {
    if (!fee.optional) return "";
    return '<label class="check"><input type="checkbox" data-index="' + i + '"' + (fee.checked ? " checked" : "") + "> " +
      escapeHtml(fee.label) + " <span>+" + money(fee.amount) + "</span></label>";
  }).join(""));

  function render() {
    var plan = rentable[Number($("#pricePlan").val())];
    var lines = [{ label: "Base rent, " + plan.name, amount: plan.rent }];

    fees.monthly.forEach(function (fee, i) {
      var included = !fee.optional || $('#feeOptionList input[data-index="' + i + '"]').is(":checked");
      if (included) lines.push(fee);
    });

    $("#priceLineList").html(lines.map(function (line) {
      return "<dt>" + escapeHtml(line.label) + "</dt><dd>" + money(line.amount) + "</dd>";
    }).join(""));

    var total = lines.reduce(function (sum, line) { return sum + line.amount; }, 0);
    $("#priceTotal").text(money(total));
  }

  $("#pricePlan").on("change", render);
  $("#feeOptionList").on("change", "input", render);
  render();
}


// ---------- 3d. Neighborhood map ----------

function setupNeighborhood(hood) {
  var modes = [["walk", "Walk"], ["bike", "Bike"], ["drive", "Drive"]];
  var mode = "bike";

  $("#travelModeList").html(modes.map(function (m) {
    return '<button type="button" aria-pressed="' + (m[0] === mode) + '" data-mode="' + m[0] + '">' + m[1] + "</button>";
  }).join(""));

  function renderPlaces() {
    $("#placeList").html(hood.places.map(function (place) {
      return "<li><span>" + escapeHtml(place.name) + "</span><strong>" + place[mode] + "</strong></li>";
    }).join(""));
  }

  $("#travelModeList").on("click", "button", function () {
    $("#travelModeList button").attr("aria-pressed", "false");
    $(this).attr("aria-pressed", "true");
    mode = $(this).data("mode");
    renderPlaces();
  });
  renderPlaces();

  // Real map with OpenStreetMap tiles (needs an internet connection)
  if (!window.L) return;
  var map = L.map("map", { scrollWheelZoom: false }).setView(hood.mapCenter, 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  var home = L.circleMarker(hood.mapCenter, { radius: 10, color: "#fff", weight: 3, fillColor: cssVar("--brand"), fillOpacity: 1 })
    .addTo(map).bindTooltip(window.PROPERTY.name, { permanent: true, direction: "top", className: "map-label map-label-home" });

  var bounds = [hood.mapCenter];
  hood.places.forEach(function (place) {
    L.circleMarker(place.coords, { radius: 7, color: "#fff", weight: 2, fillColor: cssVar("--ink"), fillOpacity: 1 })
      .addTo(map).bindTooltip(place.name, { direction: "top", className: "map-label" });
    bounds.push(place.coords);
  });
  map.fitBounds(bounds, { padding: [40, 40] });
}


// ---------- Small helpers ----------

function money(n) { return "$" + n.toLocaleString("en-US"); }

// "5:30 pm" → 1050 (minutes after midnight)
function toMinutes(time) {
  var parts = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  var hours = Number(parts[1]) % 12 + (parts[3].toLowerCase() === "pm" ? 12 : 0);
  return hours * 60 + Number(parts[2]);
}
function bedLabel(beds) { return beds === 0 ? "Studio" : beds + " Bed"; }
function unique(list) { return list.filter(function (x, i) { return list.indexOf(x) === i; }); }
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function titleCase(text) { return text.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }).split(",")[0]; }
function escapeHtml(text) { return $("<div>").text(text).html(); }

function fillIcons() {
  $("[data-icon]").each(function () { $(this).html(icon($(this).data("icon"))); });
}

// Simple line icons. Add a new one by adding a name and its SVG path.
function icon(name) {
  var paths = {
    home:      '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>',
    paw:       '<circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="4.5" cy="13.5" r="1.8"/><circle cx="19.5" cy="13.5" r="1.8"/><path d="M12 12c-3 0-5 3.5-5 5.5S9 20 12 19s5 .5 5-1.5-2-5.5-5-5.5z"/>',
    washer:    '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M7 6.5h2"/>',
    bike:      '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6l3.5 7.5M9 9l3 7.5M14 6h2l-1 3"/>',
    wave:      '<path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2-1.5 4.5-1.5S18.5 17 21 17M3 12c2 0 2-1.5 4.5-1.5S9.5 12 12 12s2-1.5 4.5-1.5S18.5 12 21 12"/>',
    car:       '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM7 19v2M17 19v2"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
    phone:     '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    message:   '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    menu:      '<path d="M4 7h16M4 12h16M4 17h16"/>',
    floorplan: '<rect x="2" y="3" width="20" height="18"/><path d="M12 3v8M2 12h7M15 12h7M12 15v6M15 12v9"/>'
  };
  return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    (paths[name] || "") + "</svg>";
}
