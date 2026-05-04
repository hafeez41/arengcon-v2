export type Category = "arch" | "int" | "cons";

export type Project = {
  slug: string;
  title: string;
  client: string;
  location: string;
  year: number;
  category: Category;
  status: "Built" | "In Progress" | "Concept";
  size: string;
  summary: string;
  description: string[];
  image: string;
  accent: string;
};

export const CATEGORY_LABELS: Record<Category, { name: string; tag: string; href: string }> = {
  arch: {
    name: "Architecture",
    tag: "Architectural design projects",
    href: "/architecture",
  },
  int: {
    name: "Interiors",
    tag: "Interior projects",
    href: "/interiors",
  },
  cons: {
    name: "Construction",
    tag: "Constructed projects",
    href: "/construction",
  },
};

export const projects: Project[] = [
  {
    slug: "north-river-crossing",
    title: "North River Crossing",
    client: "State Authority of Public Works",
    location: "Albany, NY",
    year: 2024,
    category: "arch",
    status: "Built",
    size: "1.2 km · 4 lanes",
    summary:
      "A cable-stayed crossing connecting two industrial districts, designed to flex with seasonal load and freeze-thaw cycles.",
    description: [
      "Built across an active commercial waterway, the crossing replaces a century-old swing bridge with a single continuous span. The deck rests on twin pylons with a calibrated cable harp, drawing the structural mass upward and clearing the channel below for unrestricted passage.",
      "Our team led the structural design, foundation work, and on-site coordination across forty-two months without interruption to barge traffic.",
    ],
    image: "https://picsum.photos/seed/north-river-crossing/1600/1200",
    accent: "#2a3d4a",
  },
  {
    slug: "civic-library",
    title: "Civic Library",
    client: "City of Hartford",
    location: "Hartford, CT",
    year: 2026,
    category: "arch",
    status: "In Progress",
    size: "92,000 sq ft",
    summary:
      "A new central library on a brownfield site. A continuous spiral ramp connects every floor without a single elevator on the main route.",
    description: [
      "The building is a vertical loop. From street level, a stepped ramp draws visitors past every collection in turn, returning to the cafe at the top under a daylit oculus.",
      "The structure centers on a single helical concrete spine that carries both the ramp and the floors.",
    ],
    image: "https://picsum.photos/seed/civic-library/1600/1200",
    accent: "#4a3a32",
  },
  {
    slug: "summit-residence",
    title: "Summit Residence",
    client: "Private",
    location: "Hudson Valley, NY",
    year: 2024,
    category: "arch",
    status: "Built",
    size: "8,400 sq ft",
    summary:
      "A long, low house cantilevered into a wooded slope. Designed to settle into the hillside without disturbing the watershed below.",
    description: [
      "The house extends thirty meters along the contour line, with the eastern wing supported on a single concrete pier that emerges from the bedrock. The roof folds down into a continuous overhang that shades the south-facing glass.",
      "Geothermal loops below the foundation provide the entire heating and cooling load.",
    ],
    image: "https://picsum.photos/seed/summit-residence/1600/1200",
    accent: "#494438",
  },
  {
    slug: "low-line-promenade",
    title: "Low-Line Promenade",
    client: "Greater Boston Conservancy",
    location: "Boston, MA",
    year: 2026,
    category: "arch",
    status: "Concept",
    size: "2.4 km linear",
    summary:
      "A sunken pedestrian route reclaiming an unused rail corridor as a planted, weatherproof public spine.",
    description: [
      "A continuous tensile canopy spans the corridor, gathering rainwater into a series of below-grade cisterns that irrigate the planted edges.",
      "The promenade introduces nine new connections to the surrounding street grid.",
    ],
    image: "https://picsum.photos/seed/low-line-promenade/1600/1200",
    accent: "#3a4a3a",
  },
  {
    slug: "twin-towers-east",
    title: "Twin Towers East",
    client: "Meridian Development Group",
    location: "Toronto, ON",
    year: 2025,
    category: "arch",
    status: "In Progress",
    size: "1.4M sq ft",
    summary:
      "Two slender mixed-use towers joined by a sky-bridge thirty floors above grade.",
    description: [
      "The towers share a single mechanical core to free up perimeter floor space. The bridge is an inhabited truss carrying offices, a fitness floor, and a public observation deck.",
    ],
    image: "https://picsum.photos/seed/twin-towers-east/1600/1200",
    accent: "#2d3942",
  },

  {
    slug: "harbor-yards-interior",
    title: "Harbor Yards · Interior",
    client: "Meridian Development Group",
    location: "Brooklyn, NY",
    year: 2023,
    category: "int",
    status: "Built",
    size: "210,000 sq ft",
    summary:
      "Two warehouses stripped to their post-and-beam frames and re-imagined as a creative campus.",
    description: [
      "We salvaged eighty percent of the original timber, reinforced the frame with steel jackets, and added a third floor of cross-laminated timber under a saw-tooth glass roof.",
      "The result reads as a single uninterrupted volume — light moving through the entire depth of the floorplate.",
    ],
    image: "https://picsum.photos/seed/harbor-yards-interior/1600/1200",
    accent: "#3a3530",
  },
  {
    slug: "atelier-grey",
    title: "Atelier Grey",
    client: "Studio Manon Hayes",
    location: "Manhattan, NY",
    year: 2024,
    category: "int",
    status: "Built",
    size: "6,200 sq ft",
    summary:
      "A photographer's studio carved out of a former rag-trade loft. Continuous lime-plaster walls and a pivoting daylight wall.",
    description: [
      "The lime-plaster surface absorbs sound and shifts tone with the light. A 4-meter pivoting wall opens the back studio onto the cyclorama.",
    ],
    image: "https://picsum.photos/seed/atelier-grey/1600/1200",
    accent: "#54504a",
  },
  {
    slug: "north-restaurant",
    title: "North",
    client: "North Hospitality",
    location: "Toronto, ON",
    year: 2024,
    category: "int",
    status: "Built",
    size: "4,800 sq ft",
    summary:
      "A hearth-led restaurant interior built around a single open kitchen island in oak and steel.",
    description: [
      "All the heat — a wood oven, a grill, two ranges — is consolidated into a central island, surrounded on three sides by a counter. The dining room reads as the audience.",
    ],
    image: "https://picsum.photos/seed/north-restaurant/1600/1200",
    accent: "#3e2f25",
  },
  {
    slug: "the-quiet-room",
    title: "The Quiet Room",
    client: "Brower Foundation",
    location: "London, UK",
    year: 2025,
    category: "int",
    status: "Built",
    size: "1,400 sq ft",
    summary:
      "A meditation chamber inside a working office. Acoustic isolation by mass and geometry, no electronics.",
    description: [
      "The chamber floats on neoprene pucks inside a steel cradle. Curved felt-lined walls reduce the room's acoustic decay below 0.4 seconds.",
    ],
    image: "https://picsum.photos/seed/the-quiet-room/1600/1200",
    accent: "#43403c",
  },

  {
    slug: "central-transit-hub",
    title: "Central Transit Hub",
    client: "Metropolitan Transit Authority",
    location: "Newark, NJ",
    year: 2025,
    category: "cons",
    status: "In Progress",
    size: "640,000 sq ft",
    summary:
      "A six-line transit interchange capped with a curved truss roof and a public plaza overhead.",
    description: [
      "The hub consolidates regional rail, bus, and light rail under a single weatherproof concourse. The roof is a long-span steel truss, fabricated off-site in nine sections and erected in ten weekend closures.",
      "Above grade, a public plaza recovers a city block lost to the existing rail cut.",
    ],
    image: "https://picsum.photos/seed/central-transit-hub/1600/1200",
    accent: "#2c2c2c",
  },
  {
    slug: "field-station-ii",
    title: "Field Station II",
    client: "Northern Geological Survey",
    location: "Banff, AB",
    year: 2023,
    category: "cons",
    status: "Built",
    size: "12,000 sq ft",
    summary:
      "A research outpost on glacial moraine, designed to be air-dropped, assembled, and reversed in a single season.",
    description: [
      "Every component is sized to fit a forty-foot rotor sling. The structure is bolted, never welded; the foundation is a screw-pile system that leaves the permafrost intact.",
      "At end of life, the entire station can be removed in three weeks and the site restored.",
    ],
    image: "https://picsum.photos/seed/field-station-ii/1600/1200",
    accent: "#3d4a52",
  },
  {
    slug: "marsh-bridge",
    title: "Marsh Bridge",
    client: "Coastal Trust",
    location: "Outer Banks, NC",
    year: 2023,
    category: "cons",
    status: "Built",
    size: "320 m span",
    summary:
      "A timber boardwalk bridge over tidal marsh. Built from screw-piled foundations driven during low tide windows.",
    description: [
      "Each pile sits inside a reusable steel guide and is rotated to depth without excavation. The deck is a glulam grid, prefabricated in 12-meter sections and craned into place across two seasons.",
    ],
    image: "https://picsum.photos/seed/marsh-bridge/1600/1200",
    accent: "#3b4a45",
  },
  {
    slug: "freeman-tunnel-portal",
    title: "Freeman Tunnel Portal",
    client: "DOT — Region 4",
    location: "Pittsburgh, PA",
    year: 2024,
    category: "cons",
    status: "Built",
    size: "12,800 sq ft portal",
    summary:
      "A tunnel portal expansion completed in nine weekend closures, with no permanent shutdown of the corridor.",
    description: [
      "The portal was prefabricated as four concrete shells and lowered into place by crawler crane during weekend windows. The carriageway lining was retrofitted in parallel using two semi-autonomous lining rigs.",
    ],
    image: "https://picsum.photos/seed/freeman-tunnel-portal/1600/1200",
    accent: "#2a2e35",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
