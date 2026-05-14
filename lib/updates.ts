export type Update = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  kind: "Studio" | "Press" | "Project" | "Talk";
  image: string;
};

export const updates: Update[] = [
  {
    slug: "north-river-crossing-opens",
    title: "North River Crossing opens to traffic",
    excerpt:
      "Forty-two months after groundbreaking, the new cable-stayed crossing carries its first commute.",
    body: [
      "On a clear morning this April, the State Authority of Public Works opened the North River Crossing to traffic. The deck rests on twin pylons with a calibrated cable harp drawing structural mass upward and clearing the channel below.",
      "The opening drew about four hundred guests, including the engineering teams from three subcontractors, members of the regional ironworkers' local, and several of the original archivists who supplied the photographs of the 1923 swing bridge it replaces.",
    ],
    date: "2026-04-12",
    kind: "Project",
    image: "https://picsum.photos/seed/north-river-crossing-opens/1600/1200",
  },
  {
    slug: "london-studio-opens",
    title: "London studio opens in Shoreditch",
    excerpt:
      "Our third permanent office, anchoring our European infrastructure work.",
    body: [
      "After two years of project-based work in the UK, we've opened a permanent studio at 44 Charlotte Road in Shoreditch. The London office will be led by partner Idris Karam and will focus on civic and infrastructure briefs.",
    ],
    date: "2026-03-02",
    kind: "Studio",
    image: "https://picsum.photos/seed/london-studio-opens/1600/1200",
  },
  {
    slug: "long-century-talk",
    title: "Talk · Building for the long century",
    excerpt:
      "Partner Mira Olshansky on designing for material fatigue, climate drift, and the next eighty years.",
    body: [
      "Mira will be giving a public talk at the Cooper Union on April 22nd, drawing on a decade of post-occupancy data from completed Arengcon projects. The talk is free; no reservation required.",
    ],
    date: "2026-04-01",
    kind: "Talk",
    image: "https://picsum.photos/seed/long-century-talk/1600/1200",
  },
  {
    slug: "press-architectural-record",
    title: "Architectural Record · Twin Towers East feature",
    excerpt:
      "An eight-page feature on the wind-shaped form of our Toronto towers.",
    body: [
      "Architectural Record's spring issue carries a long-form piece on the design and engineering of Twin Towers East. The print issue is on newsstands now.",
    ],
    date: "2026-02-18",
    kind: "Press",
    image: "https://picsum.photos/seed/press-architectural-record/1600/1200",
  },
  {
    slug: "field-station-ii-decommission",
    title: "Field Station II decommissioning report",
    excerpt:
      "Returning a site to the moraine — three weeks, no excavation, no waste.",
    body: [
      "After eighteen months of operation, Field Station II was disassembled and air-lifted back to its staging site in three weeks. The screw-pile foundations were extracted intact and the site restored to within five centimeters of pre-construction grade.",
    ],
    date: "2026-01-22",
    kind: "Project",
    image: "https://picsum.photos/seed/field-station-ii-decommission/1600/1200",
  },
  {
    slug: "civic-library-topping-out",
    title: "Civic Library tops out",
    excerpt:
      "The helical concrete spine reaches its full eight stories on schedule.",
    body: [
      "We poured the final ring of the Civic Library's helical spine on a chilly Saturday in late February. From here, secondary structure and envelope follow through the spring and summer.",
    ],
    date: "2026-02-28",
    kind: "Project",
    image: "https://picsum.photos/seed/civic-library-topping-out/1600/1200",
  },
];
