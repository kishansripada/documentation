// clean-coresignal-employee.ts
// Types & Zod schema for "Clean Employee API" (Coresignal) — distilled from the provided data dictionary.
// NOTE:
// - Dates are represented as strings (often "YYYY-MM-DD"), with some fields allowing plain years or months.
// - Some booleans are delivered as integers (0/1); we model these as 0 | 1 to match source and avoid lossy coercion.
// - Many fields are optional because real-world payloads are sparse; adjust to your ingestion guarantees as needed.

import { z } from "zod";

/** Helpers */
export const Int01 = z.union([z.literal(0), z.literal(1)]);
export type Int01 = z.infer<typeof Int01>; // 0 or 1

// Very permissive date-ish strings; tighten if your pipeline guarantees strict formats.
export const DateString = z.string().min(1); // e.g., "2023-07-29" or "2013-10-01"
export const YearString = z
   .string()
   .regex(/^\d{4}$/)
   .or(z.number()); // e.g., 2013 or "2013"

// URL-ish: keep permissive to accept values without a scheme (e.g., "www.example.com").
export const Urlish = z.string().min(1);

/** ========================
 *  Section Types (nested)
 *  ======================== */

export const RecommendationItemSchema = z.object({
   recommendation: z.string().optional(),
   referee_name: z.string().optional(),
   referee_url: Urlish.optional(),
   order_in_profile: z.number().int().optional(),
});
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

export const LanguageItemSchema = z.object({
   language: z.string().optional(),
   proficiency: z.string().optional(),
   order_in_profile: z.number().int().optional(),
});
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

export const CertificationItemSchema = z.object({
   title: z.string().optional(),
   issuer: z.string().optional(),
   credential_id: z.number().int().optional(),
   certificate_url: Urlish.optional(),
   date_from: DateString.optional(),
   date_from_year: YearString.optional(),
   date_from_month: z.number().int().optional(),
   date_to: DateString.optional(),
   date_to_year: YearString.optional(),
   date_to_month: z.number().int().optional(),
   issuer_url: Urlish.optional(),
   order_in_profile: z.number().int().optional(),
});
export type CertificationItem = z.infer<typeof CertificationItemSchema>;

export const CourseItemSchema = z.object({
   organizer: z.string().optional(),
   title: z.string().optional(),
   order_in_profile: z.number().int().optional(),
});
export type CourseItem = z.infer<typeof CourseItemSchema>;

export const AwardItemSchema = z.object({
   title: z.string().optional(),
   issuer: z.string().optional(),
   description: z.string().optional(),
   date: DateString.optional(),
   order_in_profile: z.number().int().optional(),
   date_year: YearString.optional(),
   date_month: z.number().int().optional(),
});
export type AwardItem = z.infer<typeof AwardItemSchema>;

export const ActivityItemSchema = z.object({
   activity_url: Urlish.optional(),
   title: z.string().optional(),
   action: z.string().optional(),
   order_in_profile: z.number().int().optional(),
});
export type ActivityItem = z.infer<typeof ActivityItemSchema>;

export const EducationItemSchema = z.object({
   major: z.string().optional(),
   title: z.string().optional(),
   date_to: YearString.optional(),
   date_from: YearString.optional(),
   institution_url: Urlish.optional(),
   description: z.string().optional(),
   activities_and_societies: z.string().optional(),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const ExperienceItemSchema = z.object({
   // Base experience fields
   title: z.string().optional(),
   description: z.string().optional(),
   order_in_profile: z.number().int().optional(),
   company_id: z.number().int().optional(),
   company_name: z.string().optional(),
   company_url: Urlish.optional().or(z.string().optional()), // alias seen in examples
   professional_network_company_url: Urlish.optional(),
   date_from: DateString.optional(),
   date_from_year: YearString.optional(),
   date_from_month: z.number().int().optional(),
   date_to: DateString.nullable().optional(),
   date_to_year: YearString.optional(),
   date_to_month: z.number().int().optional(),
   duration: z.string().optional(),
   duration_months: z.number().int().optional(),
   department: z.string().optional(),
   management_level: z.string().optional(),
   location: z.string().optional(),

   // Enriched employer/company fields (when experience joined to company datasets)
   company_type: z.string().optional(),
   company_founded: z.string().optional(),
   company_followers_count: z.number().int().optional(),
   company_website: Urlish.optional(),
   company_facebook_url: z.array(Urlish).optional(),
   company_twitter_url: z.array(Urlish).optional(),
   company_professional_network_url: Urlish.optional(),
   company_size_range: z.string().optional(),
   company_size_employees_count: z.number().int().optional(),
   company_industry: z.string().optional(),
   company_location_hq_full_address: z.string().optional(),
   company_location_hq_country: z.string().optional(),
   company_location_hq_regions: z.array(z.string()).optional(),
   company_location_hq_country_iso2: z.string().optional(),
   company_location_hq_country_iso3: z.string().optional(),
   company_location_hq_city: z.string().optional(),
   company_location_hq_state: z.string().optional(),
   company_location_hq_street: z.string().optional(),
   company_location_hq_zipcode: z.string().optional(),
   company_last_updated: DateString.optional(),
   company_categories_and_keywords: z.array(z.string()).optional(),
   company_stock_ticker: z.array(z.string()).optional(),
   company_is_b2b: Int01.optional(),
   company_annual_revenue: z.number().optional(),
   company_annual_revenue_currency: z.string().optional(),
   company_employees_count_change_yearly_percentage: z.number().optional(),
   company_last_funding_round_announced_date: DateString.optional(),
   company_last_funding_round_amount_raised: z.number().optional(),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const PatentInventorSchema = z.object({
   full_name: z.string().optional(),
   profile_url: Urlish.optional(),
   order_in_profile: z.number().int().optional(),
});
export type PatentInventor = z.infer<typeof PatentInventorSchema>;

export const PatentItemSchema = z.object({
   title: z.string().optional(),
   status: z.string().optional(),
   inventors: z.array(PatentInventorSchema).optional(),
   date: DateString.optional(),
   date_year: YearString.optional(),
   date_month: z.number().int().optional(),
   date_day: z.number().int().optional(),
   patent_url: Urlish.optional(),
   description: z.string().optional(),
   patent_or_application_number: z.string().optional(),
   order_in_profile: z.number().int().optional(),
});
export type PatentItem = z.infer<typeof PatentItemSchema>;

export const PublicationAuthorSchema = z.object({
   full_name: z.string().optional(),
   profile_url: Urlish.optional(),
   order_in_profile: z.number().int().optional(),
});
export type PublicationAuthor = z.infer<typeof PublicationAuthorSchema>;

export const PublicationItemSchema = z.object({
   title: z.string().optional(),
   publisher: z.string().optional(),
   date: DateString.optional(),
   date_year: YearString.optional(),
   date_month: z.number().int().optional(),
   date_day: z.number().int().optional(),
   description: z.string().optional(),
   authors: z.array(PublicationAuthorSchema).optional(),
   publication_url: Urlish.optional(),
   order_in_profile: z.number().int().optional(),
});
export type PublicationItem = z.infer<typeof PublicationItemSchema>;

/** ========================
 *  Root Type & Schema
 *  ======================== */

export const CleanCoresignalEmployeeSchema = z.object({
   /** Metadata */
   last_updated: DateString.optional(),
   is_deleted: Int01.optional(),

   /** Identifiers */
   id: z.number().int().optional(),
   full_name: z.string().optional(),
   name_first: z.string().optional(),
   name_middle: z.string().optional(),
   name_last: z.string().optional(),
   websites_linkedin: Urlish.optional().describe("The LinkedIn profile URL"),
   shorthand_names: z.array(z.string()).optional(),
   picture_url: Urlish.optional(),
   follower_count: z.number().int().optional(),

   /** Skills */
   skills: z.array(z.string()).optional().describe("The raw skills of the person on linkedin"),

   /** Current/summary experience aggregates */
   description: z.string().optional(), // job position description (summary)
   company_id: z.number().int().optional(), // current employer id (enriched)
   headline: z.string().optional(),
   generated_headline: z.string().optional(),
   job_title: z.string().optional(),
   is_decision_maker: Int01.optional(),
   job_description: z.string().optional(),
   total_experience_duration: z.string().optional(),
   total_experience_duration_months: z.number().int().optional(),

   /** Experience collection (history + joined company enrichment) */
   experience: z.array(ExperienceItemSchema).optional(),

   /** Employment status flags (derived) */
   department: z.string().optional(),
   management_level: z.string().optional(),
   is_working: Int01.optional(),

   /** Education */
   education: z.array(EducationItemSchema).optional(),

   /** Hidden collections marker */
   is_hidden: Int01.optional(), // 0 – visible, 1 – hidden at scrape time

   /** Location */
   location_raw_address: z.string().optional(),
   location_country: z.string().optional(),
   location_regions: z.array(z.string()).optional(),
   location_city: z.string().optional(),
   location_state: z.string().optional(),
   location_country_iso_2: z.string().optional(),
   location_country_iso_3: z.string().optional(),

   /** Recommendations & connections */
   recommendations: z.array(RecommendationItemSchema).optional(),
   recommendations_count: z.number().int().optional(),
   connections_count: z.number().int().optional(),

   /** Languages */
   languages: z.array(LanguageItemSchema).optional(),

   /** Certifications */
   certifications: z.array(CertificationItemSchema).optional(),

   /** Courses */
   courses: z.array(CourseItemSchema).optional(),

   /** Awards */
   awards: z.array(AwardItemSchema).optional(),

   /** Activity */
   activity: z.array(ActivityItemSchema).optional(),

   /** Organizations */
   member_public_profile_id: z.string().optional(),
   member_organizations: z
      .array(
         z.object({
            organization: z.string().optional(),
            position: z.string().optional(),
            description: z.string().optional(),
            date_from: z.string().optional(), // sometimes YYYY-MM
            date_from_year: YearString.optional(),
            date_from_month: z.number().int().optional(),
            date_to: z.string().optional(), // sometimes YYYY-MM
            date_to_year: YearString.optional(),
            date_to_month: z.number().int().optional(),
            order_in_profile: z.number().int().optional(),
         })
      )
      .optional(),

   /** Patents */
   member_patents: z.array(PatentItemSchema).optional(),

   /** Publications */
   member_publications: z.array(PublicationItemSchema).optional(),
});

export type CleanCoresignalEmployee = z.infer<typeof CleanCoresignalEmployeeSchema>;

// Re-export under the requested name
export const cleanCoresignalEmployeeSchema = CleanCoresignalEmployeeSchema;
export type CleanCoresignalEmployeeType = CleanCoresignalEmployee;
