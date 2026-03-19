export interface ApplicationRow {
  company: string;
  role: string;
  dateApplied: string;
  status: string;
  link: string;
  location: string;
  notes: string;
  email: string;  // sender / recruiter email — used for industry classification
}

const statuses = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Ghosted",
  "OA/Technical"
];

// company → realistic sender email domain
const companyEmails: Record<string, string> = {
  "Google":      "no-reply@google.com",
  "Microsoft":   "careers@microsoft.com",
  "Amazon":      "amazon-jobs@amazon.com",
  "Apple":       "no_reply@email.apple.com",
  "Meta":        "jobs@facebookmail.com",
  "Netflix":     "jobs@netflix.com",
  "Stripe":      "careers@stripe.com",
  "Airbnb":      "no-reply@airbnb.com",
  "Uber":        "careers@uber.com",
  "Lyft":        "jobs@lyft.com",
  "Databricks":  "careers@databricks.com",
  "Snowflake":   "jobs@snowflake.com",
  "Palantir":    "recruiting@palantir.com",
  "Plaid":       "jobs@plaid.com",
  "Rippling":    "careers@rippling.com",
  "Notion":      "jobs@makenotion.com",
  "Figma":       "careers@figma.com",
  "Canva":       "jobs@canva.com",
  "Atlassian":   "careers@atlassian.com",
  "Block":       "jobs@squareup.com",
};

const companies = Object.keys(companyEmails);

const roles = [
  "Software Engineer", "Frontend Engineer", "Backend Engineer", "Fullstack Engineer",
  "Data Engineer", "Machine Learning Engineer", "Product Manager", "Designer"
];

const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Remote"];

export function generateMockData(count: number = 50): ApplicationRow[] {
  const data: ApplicationRow[] = [];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isRecent = Math.random() > 0.5;
    const daysAgo = isRecent ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 90) + 30;

    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);

    const rand = Math.random();
    let status = "Applied";
    if (rand > 0.95)                        status = "Offer";
    else if (rand > 0.85)                   status = "Interviewing";
    else if (rand > 0.75)                   status = "OA/Technical";
    else if (rand > 0.40)                   status = "Rejected";
    else if (rand > 0.20 && daysAgo > 30)   status = "Ghosted";

    const company = companies[Math.floor(Math.random() * companies.length)];

    data.push({
      company,
      role: roles[Math.floor(Math.random() * roles.length)],
      dateApplied: d.toISOString().split("T")[0],
      status,
      link: `https://example.com/careers/${Math.random().toString(36).substring(7)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      notes: "",
      email: companyEmails[company] ?? "",
    });
  }

  return data.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
}
