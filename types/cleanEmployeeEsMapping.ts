export const cleanEmployeeEsMapping = {
   mappings: {
      properties: {
         id: { type: "long" },
         company_id: { type: "long" },
         full_name: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         name_first: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         name_middle: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         name_last: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         websites_professional_network: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         description: { type: "text" },
         job_title: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         management_level: { type: "keyword" },
         department: { type: "keyword" },
         is_decision_maker: { type: "byte" },
         is_working: { type: "byte" },
         job_description: { type: "text" },
         activity: {
            type: "nested",
            properties: {
               activity_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               action: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               order_in_profile: { type: "integer" },
            },
         },
         organizations: {
            type: "nested",
            properties: {
               organization: { type: "text" },
               position: { type: "text" },
               description: { type: "text" },
               date_from: { type: "date" },
               date_from_year: { type: "short" },
               date_from_month: { type: "byte" },
               date_to: { type: "date" },
               date_to_year: { type: "short" },
               date_to_month: { type: "byte" },
               order_in_profile: { type: "long" },
            },
         },
         patents: {
            type: "nested",
            properties: {
               title: { type: "text" },
               status: { type: "text" },
               inventors: {
                  type: "nested",
                  properties: {
                     full_name: { type: "keyword" },
                     profile_url: { type: "text" },
                     order_in_profile: { type: "long" },
                  },
               },
               date: { type: "date" },
               date_year: { type: "short" },
               date_month: { type: "byte" },
               date_day: { type: "byte" },
               patent_url: { type: "text" },
               description: { type: "text" },
               patent_or_application_number: { type: "keyword" },
               order_in_profile: { type: "long" },
            },
         },
         publications: {
            type: "nested",
            properties: {
               title: { type: "text" },
               publisher: { type: "text" },
               date: { type: "date" },
               date_year: { type: "short" },
               date_month: { type: "byte" },
               date_day: { type: "byte" },
               description: { type: "text" },
               authors: {
                  type: "nested",
                  properties: {
                     full_name: { type: "keyword" },
                     profile_url: { type: "text" },
                     order_in_profile: { type: "long" },
                  },
               },
               publication_url: { type: "text" },
               order_in_profile: { type: "long" },
            },
         },
         awards: {
            type: "nested",
            properties: {
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               issuer: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               description: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               date: { type: "date" },
               date_year: { type: "short" },
               date_month: { type: "byte" },
               date_day: { type: "byte" },
               order_in_profile: { type: "integer" },
            },
         },
         courses: {
            type: "nested",
            properties: {
               organizer: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               order_in_profile: { type: "integer" },
            },
         },
         certifications: {
            type: "nested",
            properties: {
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               issuer: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               credential_id: { type: "keyword" },
               certificate_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               date_from: { type: "date" },
               date_from_year: { type: "short" },
               date_from_month: { type: "byte" },
               date_to: { type: "date" },
               date_to_year: { type: "short" },
               date_to_month: { type: "byte" },
               issuer_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               order_in_profile: { type: "integer" },
            },
         },
         experience: {
            type: "nested",
            properties: {
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               description: { type: "text" },
               order_in_profile: { type: "integer" },
               company_id: { type: "long" },
               company_name: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               date_from: { type: "date" },
               date_from_year: { type: "short" },
               date_from_month: { type: "byte" },
               date_to: { type: "date" },
               date_to_year: { type: "short" },
               date_to_month: { type: "byte" },
               duration: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               duration_months: { type: "long" },
               department: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               management_level: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               location: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_type: { type: "keyword" },
               company_founded: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_followers_count: { type: "long" },
               company_website: {
                  type: "text",
                  fields: {
                     exact: { type: "keyword", null_value: "NULL" },
                     domain_only: { type: "text" },
                  },
               },
               company_facebook_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_twitter_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_professional_network_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_size_range: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_size_employees_count: { type: "long" },
               company_industry: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               company_location_hq_full_address: { type: "text" },
               company_location_hq_country: { type: "keyword" },
               company_location_hq_regions: { type: "text" },
               company_location_hq_country_iso2: { type: "text" },
               company_location_hq_country_iso3: { type: "text" },
               company_location_hq_city: { type: "text" },
               company_location_hq_state: { type: "text" },
               company_location_hq_street: { type: "text" },
               company_location_hq_zipcode: { type: "text" },
               company_last_updated: { type: "date" },
               company_categories_and_keywords: { type: "text" },
               company_stock_ticker: {
                  type: "nested",
                  properties: {
                     exchange: {
                        type: "text",
                        fields: { exact: { type: "keyword", null_value: "NULL" } },
                     },
                     ticker: { type: "keyword" },
                  },
               },
               company_is_b2b: { type: "byte" },
               company_annual_revenue: { type: "long" },
               company_annual_revenue_currency: { type: "text" },
               company_employees_count_change_yearly_percentage: { type: "double" },
               company_last_funding_round_announced_date: { type: "date" },
               company_last_funding_round_amount_raised: { type: "long" },
            },
         },
         education: {
            type: "nested",
            properties: {
               title: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               major: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               institution_url: {
                  type: "text",
                  fields: {
                     exact: { type: "keyword", null_value: "NULL" },
                     domain_only: { type: "text" },
                  },
               },
               description: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               activities_and_societies: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               date_from: { type: "integer" },
               date_to: { type: "integer" },
            },
         },
         languages: {
            type: "nested",
            properties: {
               language: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               proficiency: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               order_in_profile: { type: "integer" },
            },
         },
         recommendations: {
            type: "nested",
            properties: {
               recommendation: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               referee_name: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               referee_url: {
                  type: "text",
                  fields: { exact: { type: "keyword", null_value: "NULL" } },
               },
               order_in_profile: { type: "integer" },
            },
         },
         recommendations_count: { type: "integer" },
         connections_count: { type: "integer" },
         location_raw_address: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         location_country: { type: "keyword" },
         location_regions: { type: "keyword" },
         last_updated: { type: "date" },
         is_deleted: { type: "byte" },
         is_hidden: { type: "byte" },
         follower_count: { type: "long" },
         skills: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         shorthand_names: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         headline: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         generated_headline: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         picture_url: { type: "text" },
         public_profile_id: { type: "long" },
         total_experience_duration: {
            type: "text",
            fields: { exact: { type: "keyword", null_value: "NULL" } },
         },
         total_experience_duration_months: { type: "long" },
      },
   },
} as const;

export type CleanEmployeeEsMapping = typeof cleanEmployeeEsMapping;
