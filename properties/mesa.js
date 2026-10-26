/*
  PROPERTY FILE
  Everything on the site that is specific to one property lives here.
  To launch a new property: copy this file, change the values, and add
  a matching color theme in css/theme.css.
*/
window.PROPERTY = {
  theme: "mesa",                       // matches a [data-theme] block in css/theme.css

  name: "The Mesa at Goleta",
  logo: { main: "THE MESA", sub: "AT GOLETA" },
  location: "GOLETA, CALIFORNIA",
  headline: "Coastal living, five minutes from campus.",
  intro: "Studio to three bedroom homes between UCSB and Old Town, from $2,295 a month.",

  phone: "(805) 555-0142",
  address: "1200 Mesa Verde Lane, Goleta, CA 93117",
  officeHours: "Leasing office open Mon to Sat, 9 am to 6 pm. Self guided tours daily until 8 pm.",

  special: {
    label: "Fall special",
    text: "First month half off on move ins by December 1."
  },

  // Photos: set "src" to an image path when you have one.
  // Until then, the label is shown in a placeholder box.
  photos: {
    hero:      { src: "img/mesa_hero.webp", label: "Courtyard pool at golden hour" },
    tour:      { src: "img/mesa_tour.webp", label: "Model living room, afternoon light" },
    amenities: { src: "img/mesa_amenities.webp", label: "Saltwater pool and cabanas" }
  },

  facts: [
    { icon: "home",   title: "Studio to 3 beds", text: "From $2,295 a month" },
    { icon: "paw",    title: "Pets welcome",     text: "Dog park and wash station" },
    { icon: "washer", title: "In home laundry",  text: "Full size washer and dryer" },
    { icon: "bike",   title: "12 min to UCSB",   text: "By bike, on the Obern Trail" }
  ],

  floorPlans: [
    { name: "The Arroyo",       beds: 0, baths: 1, sqft: 520,  rent: 2295, available: 2, availableOn: "now" },
    { name: "The Coronado",     beds: 1, baths: 1, sqft: 690,  rent: 2650, available: 4, availableOn: "now" },
    { name: "The Sandpiper",    beds: 1, baths: 1, sqft: 760,  rent: 2795, available: 1, availableOn: "Nov 15" },
    { name: "The Ellwood",      beds: 2, baths: 2, sqft: 1010, rent: 3450, available: 3, availableOn: "now" },
    { name: "The Devereux",     beds: 2, baths: 2, sqft: 1095, rent: 3625, available: 0, availableOn: "Jan 5" },
    { name: "The Campus Point", beds: 3, baths: 2, sqft: 1320, rent: 4395, available: 2, availableOn: "Dec 1" }
  ],

  tour: {
    intro: "Let yourself in for a self guided tour until 8 pm, meet a leasing agent, or walk through live on video.",
    types: [
      { label: "Self guided",   note: "Let yourself in with a code sent to your phone. ID check required.", times: ["3:00 pm", "5:30 pm", "6:30 pm", "7:30 pm"] },
      { label: "With agent",    note: "A leasing agent will meet you at the front office.",                  times: ["10:00 am", "1:00 pm", "3:00 pm", "5:00 pm"] },
      { label: "Live video",    note: "We will call you on FaceTime or Zoom and walk you through.",          times: ["11:00 am", "2:00 pm", "4:30 pm"] }
    ]
  },

  // Monthly costs on top of rent. "optional: true" items get a checkbox.
  fees: {
    monthly: [
      { label: "Pet rent",                      amount: 50, optional: true,  checked: true },
      { label: "Reserved parking",              amount: 75, optional: true,  checked: true },
      { label: "Storage locker",                amount: 40, optional: true,  checked: false },
      { label: "Trash, water and sewer (est.)", amount: 95, optional: false }
    ],
    oneTime: "One time: application $45, deposit from $500. Fall special applied at signing."
  },

  amenities: [
    { title: "Saltwater pool and spa", text: "Heated year round, with cabanas" },
    { title: "Bike workshop",          text: "Secure storage and repair stand" },
    { title: "Dog park",               text: "Fenced, with a wash station" },
    { title: "Study lounge",           text: "Quiet rooms and gigabit Wi Fi" },
    { title: "Fitness center",         text: "Open 24 hours" },
    { title: "Package lockers",        text: "Pickup any time, with text alerts" }
  ],

  neighborhood: {
    headline: "Beach, campus and Old Town, all nearby.",
    mapCenter: [34.4334, -119.8395],
    places: [
      { name: "Goleta Beach Park",       coords: [34.4171, -119.8296], walk: "25 min", bike: "8 min",  drive: "5 min" },
      { name: "UC Santa Barbara",        coords: [34.4140, -119.8489], walk: "40 min", bike: "12 min", drive: "8 min" },
      { name: "Old Town Goleta",         coords: [34.4389, -119.8273], walk: "15 min", bike: "6 min",  drive: "4 min" },
      { name: "Camino Real Marketplace", coords: [34.4296, -119.8732], walk: "45 min", bike: "14 min", drive: "7 min" }
    ]
  }
};
