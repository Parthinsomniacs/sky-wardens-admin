/**
 * Centralized mock data store for Sky Wardens Admin Console.
 * Standardized across Dashboard, Contact Leads, Product Inquiries,
 * and User Management.
 */

/**
 * Exact contact inquiry types as configured on the Sky Wardens
 * public website contact form (app/contact/sections/ContactFormSection.tsx).
 */
export const CONTACT_TYPES = [
  "Product(s) Inquiry",
  "Strategic Partnership / Joint Venture",
  "Procurement / Tender",
  "Distributor / Channel Partnership",
  "Institutional / Government Engagement",
  "Affiliations / Collaboration",
  "Careers / Recruitment",
  "Media / Corporate Communication",
  "General Inquiry",
];

export const INITIAL_LEADS = [];

export const INITIAL_ADMIN_USERS = [
  {
    id: "USR-001",
    name: "Super Admin",
    email: "admin@skywardens.com",
    role: "Super Admin",
    department: "Executive Operations",
    clearance: "Full System Access (Includes Leads)",
    status: "Active",
    lastLogin: "Active Now",
    avatar: "SA",
  },
  {
    id: "USR-002",
    name: "Wing Cdr. Vikram Malhotra (Retd.)",
    email: "v.malhotra@skywardens.com",
    role: "Normal Admin",
    department: "Government & Military Relations",
    clearance: "Operational Access (No Leads)",
    status: "Active",
    lastLogin: "Today, 09:15",
    avatar: "VM",
  },
  {
    id: "USR-003",
    name: "Dr. Ananya Sharma",
    email: "a.sharma@skywardens.com",
    role: "Normal Admin",
    department: "Aerospace R&D",
    clearance: "Operational Access (No Leads)",
    status: "Active",
    lastLogin: "Yesterday, 17:40",
    avatar: "AS",
  },
  {
    id: "USR-004",
    name: "Marcus Vance",
    email: "m.vance@skywardens.com",
    role: "Normal Admin",
    department: "Corporate Communications",
    clearance: "Operational Access (No Leads)",
    status: "Active",
    lastLogin: "Oct 09, 2026",
    avatar: "MV",
  },
];
