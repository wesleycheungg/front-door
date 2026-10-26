/*
  PROPERTY FILE: a second property, to show the template working for
  another client. Same fields as mesa.js, different values and theme.
*/
window.PROPERTY = {
  theme: "harbor",

  name: "Harborview Residences",
  logo: { main: "HARBORVIEW", sub: "RESIDENCES" },
  location: "SANTA BARBARA, CALIFORNIA",
  headline: "Ocean air, downtown energy.",
  intro: "Modern homes three blocks from Stearns Wharf, from $2,550 a month.",

  phone: "(805) 555-0187",
  address: "45 Cabrillo Court, Santa Barbara, CA 93101",
  officeHours: "Leasing office open daily, 10 am to 7 pm. Self guided tours daily until 8 pm.",

  special: {
    label: "This week",
    text: "Tour by Sunday and we will waive your application fee."
  },

  photos: {
    hero:      { src: "img/harbor_hero.webp", label: "Rooftop terrace at sunset" },
    tour:      { src: "img/harbor_tour.webp", label: "Living room with ocean view" },
    amenities: { src: "img/harbor_amenities.webp", label: "Rooftop fire pits" }
  },

  facts: [
    { icon: "home",  title: "Studio to 2 beds", text: "From $2,550 a month" },
    { icon: "wave",  title: "3 blocks to beach", text: "Stearns Wharf and East Beach" },
    { icon: "car",   title: "EV charging",       text: "In the secured garage" },
    { icon: "paw",   title: "Pets welcome",      text: "Up to two per home" }
  ],

  floorPlans: [
    { name: "Breakwater",     beds: 0, baths: 1, sqft: 480,  rent: 2550, available: 3, availableOn: "now" },
    { name: "The Wharf",      beds: 1, baths: 1, sqft: 710,  rent: 3150, available: 2, availableOn: "now" },
    { name: "The Lighthouse", beds: 2, baths: 2, sqft: 1040, rent: 4250, available: 1, availableOn: "Dec 10" },
    { name: "The Channel",    beds: 2, baths: 2, sqft: 1150, rent: 4495, available: 0, availableOn: "Feb 1" }
  ],

  tour: {
    intro: "Tour on your own until 8 pm, meet our team, or take a live video tour from anywhere.",
    types: [
      { label: "Self guided",   note: "Let yourself in with a code sent to your phone. ID check required.", times: ["4:00 pm", "6:00 pm", "7:30 pm"] },
      { label: "With agent",    note: "Meet our team in the lobby by the coffee bar.",                       times: ["10:30 am", "1:30 pm", "4:30 pm"] },
      { label: "Live video",    note: "We will call you on FaceTime or Zoom and walk you through.",          times: ["11:00 am", "3:00 pm"] }
    ]
  },

  fees: {
    monthly: [
      { label: "Pet rent",            amount: 60,  optional: true,  checked: false },
      { label: "Garage parking",      amount: 150, optional: true,  checked: true },
      { label: "Utilities (est.)",    amount: 120, optional: false }
    ],
    oneTime: "One time: application fee waived this week, deposit from $750."
  },

  amenities: [
    { title: "Rooftop terrace", text: "Fire pits and grills with harbor views" },
    { title: "Yoga studio",     text: "Daily classes and on demand sessions" },
    { title: "Beach cruisers",  text: "Free bikes for residents" },
    { title: "EV charging",     text: "Level 2 chargers in the garage" },
    { title: "Coffee bar",      text: "Local roasts every morning" },
    { title: "Concierge",       text: "Package and dry cleaning service" }
  ],

  neighborhood: {
    headline: "The beach, the Funk Zone and State Street, steps away.",
    mapCenter: [34.4110, -119.6890],
    places: [
      { name: "Stearns Wharf",          coords: [34.4087, -119.6854], walk: "5 min",  bike: "2 min", drive: "3 min" },
      { name: "Funk Zone",              coords: [34.4140, -119.6895], walk: "4 min",  bike: "2 min", drive: "3 min" },
      { name: "State Street Promenade", coords: [34.4190, -119.6970], walk: "10 min", bike: "4 min", drive: "6 min" },
      { name: "Santa Barbara Amtrak",   coords: [34.4136, -119.6928], walk: "6 min",  bike: "3 min", drive: "4 min" }
    ]
  }
};
