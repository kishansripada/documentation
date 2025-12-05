import { z } from "zod";

export type CleanCoresignalCompany = z.infer<typeof CleanCoresignalCompanySchema>;

export const CleanCoresignalCompanySchema = z.object({
   // Metadata
   created_at: z.string().optional(),
   last_updated: z.string().optional(),
   professional_network_source_id: z.string().optional(),

   // Identifiers
   id: z.number(),
   name: z.string().optional(),
   logo: z.string().optional(),
   ticker: z.string().optional(),
   exchange: z.string().optional(),

   // Firmographics
   industry: z.string().optional(),
   type: z.string().optional(),
   founded: z.string().optional(),
   size_range: z.string().optional(),
   size_employees_count: z.number().optional(),
   followers: z.number().optional(),
   description: z.string().optional(),
   specialities: z.array(z.string()).optional(),
   metadata_title: z.string().optional(),
   metadata_description: z.string().optional(),
   enriched_summary: z.string().optional(),
   enriched_category: z.string().optional(),
   enriched_keywords: z.array(z.string()).optional(),
   enriched_b2b: z.number().optional(),

   // Product and services overview
   pricing_available: z.boolean().optional(),
   free_trial_available: z.boolean().optional(),
   demo_available: z.boolean().optional(),
   is_downloadable: z.boolean().optional(),
   mobile_apps_exist: z.boolean().optional(),
   online_reviews_exist: z.boolean().optional(),
   api_docs_exist: z.boolean().optional(),

   // Contact information
   phone_numbers: z.array(z.string()).optional(),
   emails: z.array(z.string()).optional(),

   // Social media and websites
   websites_linkedin: z.string().optional(),
   websites_linkedin_canonical: z.string().optional(),
   websites_main_original: z.string().optional(),
   websites_main: z.string().optional(),
   websites_resolved: z.string().optional(),
   websites_facebook: z.string().optional(),
   websites_twitter: z.string().optional(),
   social_discord_urls: z.array(z.string()).optional(),
   social_facebook_urls: z.array(z.string()).optional(),
   social_instagram_urls: z.array(z.string()).optional(),
   social_professional_network_urls: z.array(z.string()).optional(),
   social_pinterest_urls: z.array(z.string()).optional(),
   social_tiktok_urls: z.array(z.string()).optional(),
   social_twitter_urls: z.array(z.string()).optional(),
   social_x_urls: z.array(z.string()).optional(),
   social_youtube_urls: z.array(z.string()).optional(),
   social_github_urls: z.array(z.string()).optional(),
   social_reddit_urls: z.array(z.string()).optional(),

   // Location
   location_hq_country: z.string().optional(),
   location_hq_raw_address: z.string().optional(),
   location_hq_regions: z.string().optional(),
   locations_full: z
      .array(
         z.object({
            location_adress: z.string().optional(),
            is_primary: z.boolean().optional(),
         })
      )
      .optional(),

   // Funding information
   funding_rounds: z
      .array(
         z.object({
            last_round_investors_count: z.number().optional(),
            total_rounds_count: z.number().optional(),
            last_round_type: z.string().optional(),
            last_round_date: z.string().optional(),
            last_round_money_raised: z.number().optional(),
            financial_website_url: z.string().optional(),
         })
      )
      .optional(),

   // Technologies
   technologies_used: z
      .array(
         z.object({
            technology: z.string().optional(),
            first_verified_at: z.string().optional(),
            last_verified_at: z.string().optional(),
         })
      )
      .optional(),

   // Supporting fields
   expired_domain: z.number().optional(),
   unique_domain: z.number().optional(),
   unique_website: z.number().optional(),

   // Company updates
   updates: z
      .array(
         z.object({
            urn: z.string().optional(),
            followers: z.string().optional(),
            date: z.string().optional(),
            description: z.string().optional(),
            reactions_count: z.number().optional(),
            comments_count: z.number().optional(),
            reshared_post_author: z.string().optional(),
            reshared_post_author_url: z.string().optional(),
            reshared_post_author_headline: z.string().optional(),
            reshared_post_description: z.string().optional(),
            reshared_post_followers: z.number().optional(),
            reshared_post_date: z.string().optional(),
         })
      )
      .optional(),
});
