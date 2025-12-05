import { z } from "zod";

// Helpers consistent with existing employee/company schemas
export const Int01 = z.union([z.literal(0), z.literal(1)]);
export const DateString = z.string().min(1);

// Reusable nested schemas
const KeyValueNumberChangeSchema = z.object({
   current: z.number().optional(),
   change_monthly: z.number().optional(),
   change_monthly_percentage: z.number().optional(),
   change_quarterly: z.number().optional(),
   change_quarterly_percentage: z.number().optional(),
   change_yearly: z.number().optional(),
   change_yearly_percentage: z.number().optional(),
});

const ByMonthNumberSchema = z.object({
   date: z.string().optional(),
   // different series use different value keys; keep union of possible
   follower_count: z.number().optional(),
   total_website_visits: z.number().optional(),
   employees_count_inferred: z.number().optional(),
   employees_count: z.number().optional(),
   product_reviews_score: z.number().optional(),
   aggregated_score: z.number().optional(),
   business_outlook_score: z.number().optional(),
   career_opportunities_score: z.number().optional(),
   ceo_approval_score: z.number().optional(),
   compensation_benefits_score: z.number().optional(),
   culture_values_score: z.number().optional(),
   diversity_inclusion_score: z.number().optional(),
   recommend_score: z.number().optional(),
   senior_management_score: z.number().optional(),
   work_life_balance_score: z.number().optional(),
});

export const MultiCoresignalCompanySchema = z.object({
   // Metadata
   id: z.number().optional(),
   source_id: z.string().optional(),
   expired_domain: z.union([z.boolean(), z.number()]).optional(),
   unique_domain: z.union([z.boolean(), z.number()]).optional(),
   unique_website: z.union([z.boolean(), z.number()]).optional(),
   last_updated_at: z.string().optional(),
   created_at: z.string().optional(),

   // Firmographics
   company_name: z.string().optional(),
   company_name_alias: z.array(z.string()).optional(),
   company_legal_name: z.string().optional(),
   company_logo: z.string().optional(),
   company_logo_url: z.string().optional(),
   is_b2b: z.union([Int01, z.boolean()]).optional(),
   industry: z.string().optional(),
   type: z.string().optional(),
   founded_year: z.string().optional(),

   // Codes
   sic_codes: z.array(z.string()).optional(),
   naics_codes: z.array(z.string()).optional(),

   // Descriptions
   description: z.string().optional(),
   description_enriched: z.string().optional(),
   description_metadata_raw: z.string().optional(),

   // Size
   size_range: z.string().optional(),
   employees_count: z.number().optional(),

   // Inferred counts
   employees_count_inferred: z.number().optional(),
   employees_count_inferred_by_month: z.array(ByMonthNumberSchema).optional(),

   // Categories & keywords
   categories_and_keywords: z.array(z.string()).optional(),

   // Ownership & status
   status: z
      .object({
         value: z.string().optional(),
         comment: z.string().optional(),
      })
      .optional(),
   ownership_status: z.string().optional(),
   parent_company_information: z
      .object({
         parent_company_name: z.string().optional(),
         parent_company_website: z.string().optional(),
         date: z.string().optional(),
      })
      .optional(),

   // Company updates
   company_updates: z
      .array(
         z.object({
            followers: z.number().optional(),
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

   // Locations
   hq_region: z.array(z.string()).optional(),
   hq_country: z.string().optional(),
   hq_country_iso2: z.string().optional(),
   hq_country_iso3: z.string().optional(),
   hq_location: z.string().optional(),
   hq_full_address: z.string().optional(),
   hq_city: z.string().optional(),
   hq_state: z.string().optional(),
   hq_street: z.string().optional(),
   hq_zipcode: z.string().optional(),
   company_locations: z
      .array(
         z.object({
            location_address: z.string().optional(),
            is_primary: z.boolean().optional(),
         })
      )
      .optional(),

   // Public contact details
   company_phone_numbers: z.array(z.string()).optional(),
   company_emails: z.array(z.string()).optional(),

   // Followers
   followers_count_professional_network: z.number().optional(),
   followers_count_twitter: z.number().optional(),
   followers_count_owler: z.number().optional(),
   professional_network_followers_count_change: KeyValueNumberChangeSchema.optional(),
   professional_network_followers_count_by_month: z.array(ByMonthNumberSchema).optional(),

   // Competitors
   competitors: z
      .array(
         z.object({
            company_name: z.string().optional(),
            similarity_score: z.number().optional(),
         })
      )
      .optional(),
   competitors_websites: z
      .array(
         z.object({
            website: z.string().optional(),
            similarity_score: z.number().optional(),
            total_website_visits_monthly: z.number().optional(),
            category: z.string().optional(),
            rank_category: z.number().optional(),
         })
      )
      .optional(),

   // Product overview
   pricing_available: z.boolean().optional(),
   free_trial_available: z.boolean().optional(),
   demo_available: z.boolean().optional(),
   is_downloadable: z.boolean().optional(),
   mobile_apps_exist: z.boolean().optional(),
   online_reviews_exist: z.boolean().optional(),
   documentation_exist: z.boolean().optional(),
   product_pricing_summary: z
      .array(
         z.object({
            type: z.string().optional(),
            price: z.string().optional(),
            details: z.string().optional(),
         })
      )
      .optional(),
   product_reviews_count: z.number().optional(),
   product_reviews_aggregate_score: z.number().optional(),
   product_reviews_score_by_month: z.array(ByMonthNumberSchema).optional(),
   product_reviews_score_distribution: z
      .object({
         score_1: z.number().optional(),
         score_2: z.number().optional(),
         score_3: z.number().optional(),
         score_4: z.number().optional(),
         score_5: z.number().optional(),
      })
      .optional(),
   product_reviews_score_change: KeyValueNumberChangeSchema.optional(),

   // Financials
   revenue_annual_range: z
      .object({})
      .catchall(
         z.object({
            annual_revenue_range_from: z.number().optional(),
            annual_revenue_range_to: z.number().optional(),
            annual_revenue_range_currency: z.string().optional(),
         })
      )
      .optional(),
   revenue_annual: z
      .object({})
      .catchall(
         z.object({
            annual_revenue: z.number().optional(),
            annual_revenue_currency: z.string().optional(),
         })
      )
      .optional(),
   revenue_quarterly: z
      .object({
         value: z.number().optional(),
         currency: z.string().optional(),
      })
      .optional(),
   is_public: z.union([Int01, z.boolean()]).optional(),
   ipo_date: z.string().optional(),
   ipo_share_price: z.number().optional(),
   ipo_share_price_currency: z.string().optional(),
   stock_ticker: z
      .array(
         z.object({
            exchange: z.string().optional(),
            ticker: z.string().optional(),
         })
      )
      .optional(),
   stock_information: z
      .array(
         z.object({
            closing_price: z.number().optional(),
            currency: z.string().optional(),
            date: z.string().optional(),
            marketcap: z.number().optional(),
         })
      )
      .optional(),
   income_statements: z
      .array(
         z.object({
            cost_of_goods_sold: z.number().optional(),
            currency: z.string().optional(),
            depreciation_mortization: z.number().optional(),
            ebit: z.number().optional(),
            ebitda: z.number().optional(),
            ebitda_margin: z.number().optional(),
            ebit_margin: z.number().optional(),
            earnings_per_share: z.number().optional(),
            gross_profit: z.number().optional(),
            gross_profit_margin: z.number().optional(),
            income_tax_expense: z.number().optional(),
            interest_expense: z.number().optional(),
            interest_income: z.number().optional(),
            period_display_end_date: z.string().optional(),
            period_end_date: z.string().optional(),
            period_type: z.string().optional(),
            pre_tax_profit: z.number().optional(),
            revenue: z.number().optional(),
            revenue_growth: z.number().optional(),
            total_operating_expense: z.number().optional(),
         })
      )
      .optional(),

   // Funding
   last_funding_round_name: z.string().optional(),
   last_funding_round_announced_date: z.string().optional(),
   last_funding_round_lead_investors: z.array(z.string()).optional(),
   last_funding_round_amount_raised: z.number().optional(),
   last_funding_round_amount_raised_currency: z.string().optional(),
   last_funding_round_num_investors: z.number().optional(),
   funding_rounds: z
      .array(
         z.object({
            name: z.string().optional(),
            announced_date: z.string().optional(),
            lead_investors: z.array(z.string()).optional(),
            amount_raised: z.number().optional(),
            amount_raised_currency: z.string().optional(),
            num_investors: z.number().optional(),
         })
      )
      .optional(),

   // Acquisitions
   acquired_by_summary: z
      .object({
         acquirer_name: z.string().optional(),
         announced_date: z.string().optional(),
         price: z.number().optional(),
         currency: z.string().optional(),
      })
      .optional(),
   num_acquisitions_source_1: z.number().optional(),
   num_acquisitions_source_2: z.number().optional(),
   num_acquisitions_source_5: z.number().optional(),
   acquisition_list_source_1: z
      .array(
         z.object({
            acquiree_name: z.string().optional(),
            announced_date: z.string().optional(),
            price: z.number().optional(),
            currency: z.string().optional(),
         })
      )
      .optional(),
   acquisition_list_source_2: z
      .array(
         z.object({
            acquiree_name: z.string().optional(),
            announced_date: z.string().optional(),
            price: z.number().optional(),
            currency: z.string().optional(),
         })
      )
      .optional(),
   acquisition_list_source_5: z
      .array(
         z.object({
            acquiree_name: z.string().optional(),
            announced_date: z.string().optional(),
            price: z.number().optional(),
            currency: z.string().optional(),
         })
      )
      .optional(),

   // News features
   num_news_articles: z.number().optional(),
   news_articles: z
      .array(
         z.object({
            headline: z.string().optional(),
            published_date: z.string().optional(),
            summary: z.string().optional(),
            article_url: z.string().optional(),
            source: z.string().optional(),
         })
      )
      .optional(),

   // Technographics
   num_technologies_used: z.number().optional(),
   technologies_used: z
      .array(
         z.object({
            technology: z.string().optional(),
            first_verified_at: z.string().optional(),
            last_verified_at: z.string().optional(),
         })
      )
      .optional(),

   // Websites & social
   website: z.string().optional(),
   website_alias: z.array(z.string()).optional(),
   linkedin_url: z.string().optional(),
   twitter_url: z.array(z.string()).optional(),
   discord_url: z.array(z.string()).optional(),
   facebook_url: z.array(z.string()).optional(),
   instagram_url: z.array(z.string()).optional(),
   pinterest_url: z.array(z.string()).optional(),
   tiktok_url: z.array(z.string()).optional(),
   youtube_url: z.array(z.string()).optional(),
   github_url: z.array(z.string()).optional(),
   reddit_url: z.array(z.string()).optional(),
   financial_website_url: z.string().optional(),

   // Website traffic
   total_website_visits_monthly: z.number().optional(),
   visits_change_monthly: z.number().optional(),
   rank_global: z.number().optional(),
   rank_country: z.number().optional(),
   rank_category: z.number().optional(),
   bounce_rate: z.number().optional(),
   pages_per_visit: z.number().optional(),
   average_visit_duration_seconds: z.number().optional(),
   similarly_ranked_websites: z.array(z.string()).optional(),
   top_topics: z.array(z.string()).optional(),
   total_website_visits_change: KeyValueNumberChangeSchema.optional(),
   total_website_visits_by_month: z.array(ByMonthNumberSchema).optional(),
   visits_breakdown_by_country: z
      .array(
         z.object({
            country: z.string().optional(),
            percentage: z.number().optional(),
            percentage_monthly_change: z.number().optional(),
         })
      )
      .optional(),
   visits_breakdown_by_gender: z
      .object({
         male_percentage: z.number().optional(),
         female_percentage: z.number().optional(),
      })
      .optional(),
   visits_breakdown_by_age: z
      .object({
         age_18_24_percentage: z.number().optional(),
         age_25_34_percentage: z.number().optional(),
         age_35_44_percentage: z.number().optional(),
         age_45_54_percentage: z.number().optional(),
         age_55_64_percentage: z.number().optional(),
         age_65_plus_percentage: z.number().optional(),
      })
      .optional(),

   // Employee review scores & changes
   company_employee_reviews_count: z.number().optional(),
   company_employee_reviews_aggregate_score: z.number().optional(),
   employee_reviews_score_breakdown: z
      .object({
         business_outlook: z.number().optional(),
         career_opportunities: z.number().optional(),
         ceo_approval: z.number().optional(),
         compensation_benefits: z.number().optional(),
         culture_values: z.number().optional(),
         diversity_inclusion: z.number().optional(),
         recommend: z.number().optional(),
         senior_management: z.number().optional(),
         work_life_balance: z.number().optional(),
      })
      .optional(),
   employee_reviews_score_distribution: z
      .object({
         score_1: z.number().optional(),
         score_2: z.number().optional(),
         score_3: z.number().optional(),
         score_4: z.number().optional(),
         score_5: z.number().optional(),
      })
      .optional(),
   employee_reviews_score_aggregated_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_aggregated_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_business_outlook_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_business_outlook_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_career_opportunities_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_career_opportunities_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_ceo_approval_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_ceo_approval_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_compensation_benefits_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_compensation_benefits_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_culture_values_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_culture_values_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_diversity_inclusion_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_diversity_inclusion_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_recommend_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_recommend_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_senior_management_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_senior_management_by_month: z.array(ByMonthNumberSchema).optional(),
   employee_reviews_score_work_life_balance_change: KeyValueNumberChangeSchema.optional(),
   employee_reviews_score_work_life_balance_by_month: z.array(ByMonthNumberSchema).optional(),

   // Workforce trends
   key_executives: z
      .array(
         z.object({
            parent_id: z.number().optional(),
            member_full_name: z.string().optional(),
            member_position_title: z.string().optional(),
         })
      )
      .optional(),
   key_employee_change_events: z
      .array(
         z.object({
            employee_change_event_name: z.string().optional(),
            employee_change_event_date: z.string().optional(),
            employee_change_event_url: z.string().optional(),
         })
      )
      .optional(),
   key_executive_arrivals: z
      .array(
         z.object({
            parent_id: z.number().optional(),
            member_full_name: z.string().optional(),
            member_position_title: z.string().optional(),
            arrival_date: z.string().optional(),
         })
      )
      .optional(),
   key_executive_departures: z
      .array(
         z.object({
            parent_id: z.number().optional(),
            member_full_name: z.string().optional(),
            member_position_title: z.string().optional(),
            departure_date: z.string().optional(),
         })
      )
      .optional(),
   top_previous_companies: z
      .array(
         z.object({
            company_id: z.number().optional(),
            company_name: z.string().optional(),
            count: z.number().optional(),
         })
      )
      .optional(),
   top_next_companies: z
      .array(
         z.object({
            company_id: z.number().optional(),
            company_name: z.string().optional(),
            count: z.number().optional(),
         })
      )
      .optional(),
   employees_count_breakdown_by_department: z.object({}).catchall(z.number()).optional(),
   employees_count_breakdown_by_department_by_month: z
      .array(
         z.object({
            employees_count_breakdown_by_department: z.object({}).catchall(z.number()).optional(),
            date: z.string().optional(),
         })
      )
      .optional(),
   employees_count_by_country: z
      .array(
         z.object({
            country: z.string().optional(),
            employee_count: z.number().optional(),
         })
      )
      .optional(),
   employees_count_by_country_by_month: z
      .array(
         z.object({
            employees_count_by_country: z
               .array(
                  z.object({
                     country: z.string().optional(),
                     employee_count: z.number().optional(),
                  })
               )
               .optional(),
            date: z.string().optional(),
         })
      )
      .optional(),
   employees_count_breakdown_by_region: z.object({}).catchall(z.number()).optional(),
   employees_count_breakdown_by_region_by_month: z
      .array(
         z.object({
            employees_count_breakdown_by_region: z.object({}).catchall(z.number()).optional(),
            date: z.string().optional(),
         })
      )
      .optional(),
   employees_count_breakdown_by_seniority: z.object({}).catchall(z.number()).optional(),
   employees_count_breakdown_by_seniority_by_month: z
      .array(
         z.object({
            employees_count_breakdown_by_seniority: z.object({}).catchall(z.number()).optional(),
            date: z.string().optional(),
         })
      )
      .optional(),
   employees_count_change: KeyValueNumberChangeSchema.optional(),
   employees_count_by_month: z.array(ByMonthNumberSchema).optional(),

   // Active job postings
   active_job_postings_count: z.number().optional(),
   active_job_postings: z
      .array(
         z.object({
            job_posting_id: z.number().optional(),
            job_posting_title: z.string().optional(),
         })
      )
      .optional(),
   active_job_postings_count_by_month: z
      .array(
         z.object({
            active_job_postings_count: z.number().optional(),
            date: z.string().optional(),
         })
      )
      .optional(),
   active_job_postings_count_change: KeyValueNumberChangeSchema.optional(),

   // Salaries
   base_salary: z
      .array(
         z.object({
            title: z.string().optional(),
            salary_p25: z.number().optional(),
            salary_median: z.number().optional(),
            salary_p75: z.number().optional(),
            currency: z.string().optional(),
            pay_period: z.string().optional(),
            salary_updated_at: z.string().optional(),
         })
      )
      .optional(),
   additional_pay: z
      .array(
         z.object({
            title: z.string().optional(),
            additional_pay_values: z
               .array(
                  z.object({
                     additional_pay_p25: z.number().optional(),
                     additional_pay_median: z.number().optional(),
                     additional_pay_p75: z.number().optional(),
                     additional_pay_type: z.string().optional(),
                  })
               )
               .optional(),
            currency: z.string().optional(),
            pay_period: z.string().optional(),
            salary_updated_at: z.string().optional(),
         })
      )
      .optional(),
   total_salary: z
      .array(
         z.object({
            title: z.string().optional(),
            salary_p25: z.number().optional(),
            salary_median: z.number().optional(),
            salary_p75: z.number().optional(),
            currency: z.string().optional(),
            pay_period: z.string().optional(),
            salary_updated_at: z.string().optional(),
         })
      )
      .optional(),
});

export type MultiCoresignalCompany = z.infer<typeof MultiCoresignalCompanySchema>;
export type multiCompanyType = MultiCoresignalCompany;
