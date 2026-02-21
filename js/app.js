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
        status: "open",
        lat: 45.9237,
        lon: 6.8694
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
        status: "open",
        lat: 46.0967,
        lon: 7.2286
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
        status: "open",
        lat: 46.0207,
        lon: 7.7491
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
        status: "open",
        lat: 46.1590,
        lon: 6.6697
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
        status: "open",
        lat: 46.1939,
        lon: 6.7747
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
        status: "open",
        lat: 45.8569,
        lon: 6.6175
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
        status: "open",
        lat: 46.0059,
        lon: 6.6892
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
        status: "open",
        lat: 46.3072,
        lon: 7.4817
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
        status: "closed",
        lat: 45.8211,
        lon: 6.7269
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
/*  Map constants and helpers                                         */
/* ------------------------------------------------------------------ */

var SVG_NS = "http://www.w3.org/2000/svg";
var MAP_BOUNDS = { minLon: 6.0, maxLon: 7.9, minLat: 45.75, maxLat: 46.55 };
var MAP_WIDTH = 800;
var MAP_HEIGHT = 340;

/** Project latitude/longitude to SVG coordinates. */
function projectToMap(lat, lon) {
    var x = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * MAP_WIDTH;
    var y = (MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * MAP_HEIGHT;
    return { x: x, y: y };
}

/** Create an SVG element with optional attributes. */
function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                node.setAttribute(key, attrs[key]);
            }
        }
    }
    return node;
}

/** Label offsets to avoid overlaps on the map. */
var labelOffsets = {
    "Les Gets":    { dx: -10, dy: -8,  anchor: "end" },
    "Megève":      { dx: -10, dy: 4,   anchor: "end" },
    "Les Contamines": { dx: -10, dy: 14, anchor: "end" }
};

/* ------------------------------------------------------------------ */
/*  Map builder                                                       */
/* ------------------------------------------------------------------ */

function buildMap() {
    var mapSection = document.getElementById("map-section");
    if (!mapSection) { return; }
    mapSection.textContent = "";

    var svg = svgEl("svg", {
        "viewBox": "0 0 " + MAP_WIDTH + " " + MAP_HEIGHT,
        "class": "resort-map",
        "role": "img",
        "aria-label": "Carte des stations de ski près de Genève"
    });

    // Background
    svg.appendChild(svgEl("rect", {
        "width": String(MAP_WIDTH), "height": String(MAP_HEIGHT), "class": "map-bg"
    }));

    // Simplified Lake Geneva polygon
    svg.appendChild(svgEl("polygon", {
        "points": "59,149 80,110 140,60 210,30 265,18 340,40 380,58 391,68 330,80 240,72 150,85 80,120 59,155",
        "class": "map-lake"
    }));

    // Geneva reference marker
    var gp = projectToMap(46.2044, 6.1432);
    svg.appendChild(svgEl("circle", {
        "cx": String(gp.x), "cy": String(gp.y), "r": "5", "class": "map-city"
    }));
    var cityLabel = svgEl("text", {
        "x": String(gp.x + 8), "y": String(gp.y + 4), "class": "map-city-label"
    });
    cityLabel.textContent = "Genève";
    svg.appendChild(cityLabel);

    // Resort markers
    for (var i = 0; i < resorts.length; i++) {
        var resort = resorts[i];
        var pos = projectToMap(resort.lat, resort.lon);
        var offset = labelOffsets[resort.name] || { dx: 10, dy: 4, anchor: "start" };

        var group = svgEl("g", {
            "class": "map-marker",
            "data-resort-index": String(i)
        });

        group.appendChild(svgEl("circle", {
            "cx": String(pos.x), "cy": String(pos.y), "r": "6",
            "class": resort.status === "open" ? "marker-open" : "marker-closed"
        }));

        var label = svgEl("text", {
            "x": String(pos.x + offset.dx),
            "y": String(pos.y + offset.dy),
            "class": "map-label",
            "text-anchor": offset.anchor
        });
        label.textContent = resort.name;
        group.appendChild(label);

        svg.appendChild(group);
    }

    mapSection.appendChild(svg);
}

/* ------------------------------------------------------------------ */
/*  Search / filter                                                   */
/* ------------------------------------------------------------------ */

function filterResorts(query) {
    var cards = document.getElementById("resort-grid");
    var markers = document.querySelectorAll(".map-marker");
    var normalizedQuery = query.trim().toLowerCase();
    var anyMatch = false;

    var cardEls = cards ? cards.querySelectorAll(".resort-card") : [];
    for (var i = 0; i < resorts.length; i++) {
        var matches = normalizedQuery === "" ||
                      resorts[i].name.toLowerCase().indexOf(normalizedQuery) !== -1;
        if (matches) { anyMatch = true; }
        if (cardEls[i]) {
            if (matches) {
                cardEls[i].className = "resort-card";
            } else {
                cardEls[i].className = "resort-card hidden";
            }
        }
        if (markers[i]) {
            markers[i].setAttribute("class", matches ? "map-marker" : "map-marker map-marker-dimmed");
        }
    }

    // Show/hide "no results" message
    var existing = document.getElementById("no-results");
    if (!anyMatch && normalizedQuery !== "") {
        if (!existing && cards) {
            var msg = el("p", "no-results", "Aucune station trouvée.");
            msg.id = "no-results";
            cards.appendChild(msg);
        }
    } else if (existing) {
        existing.parentNode.removeChild(existing);
    }
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

    // Build the SVG map
    buildMap();

    // Wire up search
    var searchInput = document.getElementById("resort-search");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterResorts(searchInput.value);
        });
    }

    // Update timestamp
    var timeEl = document.getElementById("update-time");
    if (timeEl) {
        var now = new Date();
        timeEl.textContent = now.toLocaleDateString("fr-CH") + " " + now.toLocaleTimeString("fr-CH");
    }
}

document.addEventListener("DOMContentLoaded", render);
