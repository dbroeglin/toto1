"use strict";

/**
 * Météo des Neiges – static weather dashboard for ski resorts near Geneva.
 *
 * Because this is a purely static site (no back-end, no API keys exposed),
 * resort weather data is provided as a built-in dataset. In a production
 * scenario the data would come from a weather API called by a back-end
 * proxy to keep credentials secure.
 */

/* ------------------------------------------------------------------ */
/*  Weather condition helpers                                         */
/* ------------------------------------------------------------------ */

/**
 * Map a weather condition key to a descriptive emoji icon and French label.
 * Using emoji keeps the app lightweight and avoids external image requests.
 */
function weatherMeta(condition) {
    var catalog = {
        sunny:          { icon: "\u2600\uFE0F",  label: "Ensoleillé" },
        partly_cloudy:  { icon: "\u26C5",        label: "Partiellement nuageux" },
        cloudy:         { icon: "\u2601\uFE0F",  label: "Nuageux" },
        snow:           { icon: "\uD83C\uDF28\uFE0F", label: "Neige" },
        light_snow:     { icon: "\uD83C\uDF28\uFE0F", label: "Neige légère" },
        heavy_snow:     { icon: "\u2744\uFE0F",  label: "Fortes chutes de neige" },
        rain:           { icon: "\uD83C\uDF27\uFE0F", label: "Pluie" },
        fog:            { icon: "\uD83C\uDF2B\uFE0F", label: "Brouillard" },
        wind:           { icon: "\uD83D\uDCA8",  label: "Venteux" }
    };
    return catalog[condition] || { icon: "\u2753", label: condition };
}

/* ------------------------------------------------------------------ */
/*  Resort data (static / demo)                                       */
/* ------------------------------------------------------------------ */

var resorts = [
    {
        name: "Chamonix Mont-Blanc",
        altitude: "1035 – 3842 m",
        temperature: -6,
        wind: 15,
        snowDepth: 185,
        freshSnow: 20,
        condition: "snow",
        liftsOpen: 42,
        liftsTotal: 49,
        status: "open"
    },
    {
        name: "Verbier",
        altitude: "1500 – 3330 m",
        temperature: -4,
        wind: 20,
        snowDepth: 160,
        freshSnow: 15,
        condition: "partly_cloudy",
        liftsOpen: 33,
        liftsTotal: 36,
        status: "open"
    },
    {
        name: "Zermatt",
        altitude: "1620 – 3883 m",
        temperature: -8,
        wind: 10,
        snowDepth: 210,
        freshSnow: 30,
        condition: "sunny",
        liftsOpen: 52,
        liftsTotal: 52,
        status: "open"
    },
    {
        name: "Les Gets",
        altitude: "1172 – 2002 m",
        temperature: -2,
        wind: 25,
        snowDepth: 120,
        freshSnow: 10,
        condition: "cloudy",
        liftsOpen: 30,
        liftsTotal: 35,
        status: "open"
    },
    {
        name: "Avoriaz",
        altitude: "1800 – 2277 m",
        temperature: -5,
        wind: 30,
        snowDepth: 175,
        freshSnow: 25,
        condition: "heavy_snow",
        liftsOpen: 28,
        liftsTotal: 34,
        status: "open"
    },
    {
        name: "Megève",
        altitude: "1113 – 2350 m",
        temperature: -1,
        wind: 12,
        snowDepth: 95,
        freshSnow: 5,
        condition: "partly_cloudy",
        liftsOpen: 40,
        liftsTotal: 45,
        status: "open"
    },
    {
        name: "Flaine",
        altitude: "1600 – 2500 m",
        temperature: -7,
        wind: 18,
        snowDepth: 200,
        freshSnow: 35,
        condition: "snow",
        liftsOpen: 24,
        liftsTotal: 26,
        status: "open"
    },
    {
        name: "Crans-Montana",
        altitude: "1500 – 3000 m",
        temperature: -3,
        wind: 22,
        snowDepth: 140,
        freshSnow: 12,
        condition: "light_snow",
        liftsOpen: 20,
        liftsTotal: 27,
        status: "open"
    },
    {
        name: "Les Contamines",
        altitude: "1164 – 2500 m",
        temperature: 0,
        wind: 8,
        snowDepth: 80,
        freshSnow: 0,
        condition: "fog",
        liftsOpen: 0,
        liftsTotal: 23,
        status: "closed"
    }
];

/* ------------------------------------------------------------------ */
/*  DOM helpers (safe – no innerHTML)                                  */
/* ------------------------------------------------------------------ */

/**
 * Create an element, optionally with className and textContent.
 */
function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
}

/**
 * Build a single detail row (label / value pair).
 */
function detailRow(label, value) {
    var row = el("div", "detail-row");
    row.appendChild(el("span", "detail-label", label));
    row.appendChild(el("span", "detail-value", value));
    return row;
}

/* ------------------------------------------------------------------ */
/*  Card builder                                                      */
/* ------------------------------------------------------------------ */

function buildCard(resort) {
    var meta = weatherMeta(resort.condition);

    var card = el("article", "resort-card");
    card.setAttribute("aria-label", resort.name);

    // Header
    var header = el("div", "card-header");
    var title  = el("h2", null, resort.name);
    var icon   = el("span", "weather-icon", meta.icon);
    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", meta.label);
    header.appendChild(title);
    header.appendChild(icon);
    card.appendChild(header);

    // Body
    var body = el("div", "card-body");
    body.appendChild(detailRow("Altitude", resort.altitude));
    body.appendChild(detailRow("Condition", meta.label));
    body.appendChild(detailRow("Température", resort.temperature + " °C"));
    body.appendChild(detailRow("Vent", resort.wind + " km/h"));
    body.appendChild(detailRow("Hauteur de neige", resort.snowDepth + " cm"));
    body.appendChild(detailRow("Neige fraîche (24 h)", resort.freshSnow + " cm"));
    body.appendChild(detailRow("Remontées ouvertes", resort.liftsOpen + " / " + resort.liftsTotal));
    card.appendChild(body);

    // Footer / status
    var footer = el("div", "card-footer");
    var badge  = el("span", "status " + (resort.status === "open" ? "status-open" : "status-closed"),
                     resort.status === "open" ? "Ouvert" : "Fermé");
    footer.appendChild(badge);
    card.appendChild(footer);

    return card;
}

/* ------------------------------------------------------------------ */
/*  Render                                                            */
/* ------------------------------------------------------------------ */

function render() {
    var grid = document.getElementById("resort-grid");
    if (!grid) { return; }

    // Clear any existing content to ensure idempotent rendering
    grid.textContent = "";

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < resorts.length; i++) {
        fragment.appendChild(buildCard(resorts[i]));
    }
    grid.appendChild(fragment);

    // Update timestamp
    var timeEl = document.getElementById("update-time");
    if (timeEl) {
        var now = new Date();
        timeEl.textContent = now.toLocaleDateString("fr-CH") + " " + now.toLocaleTimeString("fr-CH");
    }
}

document.addEventListener("DOMContentLoaded", render);
