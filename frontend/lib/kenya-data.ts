/**
 * Kenyan reference data for registration and onboarding forms.
 * Kept in one place so the backend can later serve the same lists from an API.
 */

/** The 47 counties of Kenya. */
export const counties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta", "Garissa",
  "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu",
  "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a",
  "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu",
  "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok",
  "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
] as const;

/** Major towns / cities, grouped by county for the searchable selector. */
export const townsByCounty: Record<string, string[]> = {
  Nairobi: ["Nairobi", "Westlands", "Karen", "Ruiru", "Kasarani"],
  Mombasa: ["Mombasa", "Nyali", "Likoni", "Bamburi"],
  Kisumu: ["Kisumu", "Ahero", "Muhoroni"],
  Nakuru: ["Nakuru", "Naivasha", "Molo", "Gilgil"],
  "Uasin Gishu": ["Eldoret", "Turbo", "Burnt Forest"],
  Kiambu: ["Thika", "Juja", "Limuru", "Kiambu", "Ruiru"],
  Machakos: ["Machakos", "Athi River", "Kangundo"],
  Kajiado: ["Kajiado", "Ongata Rongai", "Kitengela", "Ngong"],
  "Nyeri": ["Nyeri", "Karatina", "Othaya"],
  Meru: ["Meru", "Maua", "Timau"],
  Kisii: ["Kisii", "Ogembo", "Suneka"],
  Kakamega: ["Kakamega", "Mumias", "Butere"],
  Kilifi: ["Kilifi", "Malindi", "Mtwapa", "Watamu"],
  Kericho: ["Kericho", "Litein", "Londiani"],
  Bungoma: ["Bungoma", "Webuye", "Kimilili"],
};

/** Countries available for personal information. */
export const countries = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Other"] as const;

export const industries = [
  "Technology & IT",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Agriculture",
  "Manufacturing",
  "Construction & Real Estate",
  "Retail & E-commerce",
  "Transport & Logistics",
  "Hospitality & Tourism",
  "Media & Entertainment",
  "Energy & Environment",
  "Telecommunications",
  "NGO & Development",
  "Government & Public Sector",
  "Legal Services",
  "Engineering",
  "Arts & Design",
  "Other",
] as const;

export const organizationTypes = [
  "Private company",
  "Government agency",
  "NGO / Non-profit",
  "Startup",
  "Educational institution",
  "Recruitment agency",
  "Cooperative / Society",
  "Individual employer",
] as const;

export const companySizes = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
] as const;

export const qualifications = [
  "Doctorate (PhD)",
  "Masters degree",
  "Bachelors degree",
  "Higher diploma",
  "Diploma",
  "Certificate",
  "Artisan / Trade test",
  "Professional qualification",
  "Secondary school (KCSE)",
  "Vocational / TVET",
  "Other training",
] as const;

/** Suggested skills for the searchable skill picker. */
export const suggestedSkills = [
  // Technical
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Django",
  "Java", "PHP", "Laravel", "C#", ".NET", "Flutter", "Kotlin", "Swift",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Excel", "Power BI", "Tableau",
  "UI/UX Design", "Figma", "Graphic Design", "Video Editing", "SEO",
  "Digital Marketing", "Data Entry", "Accounting", "Bookkeeping", "QuickBooks",
  "Welding", "Plumbing", "Electrical Installation", "Catering", "Driving",
  // Professional
  "Communication", "Teamwork", "Leadership", "Time Management", "Negotiation",
  "Problem Solving", "Customer Service", "Project Management", "Report Writing",
  "Critical Thinking", "Adaptability", "Attention to Detail",
] as const;

export const suggestedLanguages = [
  "English", "Swahili", "Kikuyu", "Luhya", "Luo", "Kalenjin", "Kamba",
  "Kisii", "Meru", "Somali", "French", "Arabic", "Mandarin", "Spanish", "German",
] as const;

export const jobCategories = [
  "Full-time jobs",
  "Part-time jobs",
  "Contract jobs",
  "Internships",
  "Industrial attachments",
  "Government jobs",
  "Remote / Freelance",
  "Online microtasks",
  "Volunteering",
  "Apprenticeships",
] as const;

export const employmentTypeLabels: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  attachment: "Attachment",
  freelance: "Freelance",
  remote: "Remote",
};

export const workModeLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-site": "On-site",
};

export const studyStatusLabels: Record<string, string> = {
  completed: "Completed",
  "in-progress": "Currently studying",
  paused: "Paused",
  "did-not-complete": "Did not complete",
};

export const contactMethodLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone call",
  whatsapp: "WhatsApp",
};

export const verificationStatusLabels: Record<string, string> = {
  "not-submitted": "Not submitted",
  "pending-review": "Pending review",
  verified: "Verified",
  "more-info-required": "More information required",
  rejected: "Rejected",
};
