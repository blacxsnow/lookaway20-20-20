// Evidence-based eye-care guidance. Every claim maps to a source below.
// Only add content that a listed source actually states.

export interface Source {
  id: string;
  short: string;
  title: string;
  publisher: string;
  detail: string;
  url: string;
}

export const SOURCES: Source[] = [
  {
    id: "aao-strain",
    short: "AAO",
    title: "Computers, Digital Devices, and Eye Strain",
    publisher: "American Academy of Ophthalmology",
    detail: "Reviewed by James M. Huffman, MD · June 2024",
    url: "https://www.aao.org/eye-health/tips-prevention/computer-usage",
  },
  {
    id: "aao-blue",
    short: "AAO",
    title: "Should You Be Worried About Blue Light?",
    publisher: "American Academy of Ophthalmology",
    detail: "Reviewed by Rahul N. Khurana, MD · March 2021",
    url: "https://www.aao.org/eye-health/tips-prevention/should-you-be-worried-about-blue-light",
  },
  {
    id: "aao-devices",
    short: "AAO",
    title: "Digital Devices and Your Eyes",
    publisher: "American Academy of Ophthalmology",
    detail: "Reviewed by Alejandra G. de Alba-Campomanes, MD, MPH",
    url: "https://www.aao.org/eye-health/tips-prevention/digital-devices-your-eyes",
  },
  {
    id: "aoa-cvs",
    short: "AOA",
    title: "Computer vision syndrome",
    publisher: "American Optometric Association",
    detail: "Patient guidance from doctors of optometry",
    url: "https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/computer-vision-syndrome",
  },
  {
    id: "bmj-2018",
    short: "BMJ 2018",
    title: "Digital eye strain: prevalence, measurement and amelioration",
    publisher: "Sheppard AL, Wolffsohn JS. BMJ Open Ophthalmology",
    detail: "2018;3(1):e000146 · peer-reviewed review",
    url: "https://bmjophth.bmj.com/content/3/1/e000146",
  },
  {
    id: "clae-2023",
    short: "Study 2023",
    title: "The effects of breaks on digital eye strain, dry eye and binocular vision: Testing the 20-20-20 rule",
    publisher: "Talens-Estarelles C, et al. Contact Lens & Anterior Eye",
    detail: "2023;46(2):101744 · clinical study",
    url: "https://doi.org/10.1016/j.clae.2022.101744",
  },
];

export interface GuideItem {
  title: string;
  body: string;
  sources: string[];
}

export const FACTS: GuideItem[] = [
  {
    title: "It's very common",
    body: "Digital eye strain is estimated to affect 50% or more of computer users.",
    sources: ["bmj-2018"],
  },
  {
    title: "It's uncomfortable, not permanent",
    body: "Long screen time doesn't permanently damage your eyes. Strain causes temporary blur, aching, dryness and stinging, much like long periods of reading or sewing.",
    sources: ["aao-strain"],
  },
  {
    title: "Why it happens",
    body: "We normally blink about 15 times a minute, but only about 5–7 times a minute on screens. Your eyes also stay locked on close focus for long stretches.",
    sources: ["aao-strain", "aoa-cvs"],
  },
  {
    title: "Do reminders actually help?",
    body: "In a 2023 study, 29 people with eye strain used 20-20-20 break reminders for two weeks. Their eye-strain and dry-eye symptoms improved, but the benefit was gone one week after they stopped. Keeping the habit going is what matters.",
    sources: ["clae-2023"],
  },
];

export const HABITS: GuideItem[] = [
  {
    title: "Follow 20-20-20",
    body: "Every 20 minutes, look at something at least 20 feet (6 m) away for at least 20 seconds.",
    sources: ["aao-blue", "aoa-cvs"],
  },
  {
    title: "Blink on purpose",
    body: "Make a conscious effort to blink fully and often. It keeps the surface of your eyes from drying out.",
    sources: ["aao-strain"],
  },
  {
    title: "Take a longer rest",
    body: "After 2 hours of continuous screen use, rest your eyes for 15 minutes.",
    sources: ["aoa-cvs"],
  },
  {
    title: "Sit at arm's length",
    body: "Keep the screen about 25 inches (≈ 63 cm) away — roughly an arm's length. The AOA suggests 20–28 inches (≈ 50–70 cm).",
    sources: ["aao-strain", "aoa-cvs"],
  },
  {
    title: "Look slightly down",
    body: "Place the centre of the screen 15–20° below eye level — about 4–5 inches (≈ 10–13 cm) — so your gaze tilts gently downward.",
    sources: ["aoa-cvs", "aao-strain"],
  },
  {
    title: "Match brightness to the room",
    body: "If your screen is brighter than your surroundings, your eyes work harder. Match the brightness to the room and try increasing contrast.",
    sources: ["aao-strain"],
  },
  {
    title: "Cut the glare",
    body: "Position the screen away from glare from windows and overhead lights. If you can't, a matte anti-glare filter can help.",
    sources: ["aoa-cvs", "aao-strain"],
  },
  {
    title: "Ease dry eyes",
    body: "Use artificial tears when eyes feel dry, and a humidifier in dry, warm rooms. Contact lens wearers: give your eyes a break by switching to glasses.",
    sources: ["aao-strain"],
  },
  {
    title: "Keep your prescription current",
    body: "Uncorrected or under-corrected vision makes digital eye strain worse. For long computer days, prescription computer glasses (set for 20–26 inch distance) may help.",
    sources: ["aoa-cvs", "aao-strain"],
  },
  {
    title: "Go easy on evening screens",
    body: "For better sleep, use night or dark mode in the evening and avoid screens 1–2 hours before bed. This is about sleep, not eye damage.",
    sources: ["aao-devices"],
  },
];

export const MYTHS: GuideItem[] = [
  {
    title: "“Blue-light glasses prevent eye strain”",
    body: "Several studies suggest they don't improve digital eye strain. The American Academy of Ophthalmology does not recommend them for computer use.",
    sources: ["aao-blue"],
  },
  {
    title: "“Blue light from screens damages your eyes”",
    body: "There's no scientific evidence that blue light from digital devices damages your eyes.",
    sources: ["aao-blue", "aao-devices"],
  },
];

export const SEE_A_DOCTOR: GuideItem = {
  title: "See an eye doctor if…",
  body: "your eyes are consistently red, blurry or watery, or they become sensitive to light or painful.",
  sources: ["aao-strain"],
};

export function sourceNumber(id: string): number {
  return SOURCES.findIndex((s) => s.id === id) + 1;
}
