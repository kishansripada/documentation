import { z } from "zod";

import { cleanEmployeeEsMapping } from "./cleanEmployeeEsMapping";
import {
   CLEAN_EMPLOYEE_FIELD_KEYS,
   CLEAN_EMPLOYEE_FIELD_REGISTRY,
   CleanEmployeeFieldEnum,
   type CleanEmployeeFieldKey
} from "./cleanEmployeeFields.generated";
import { createEsQueryLibraryBase, type ESQuery, type TermsValue } from "../shared/esQueryLibraryBase";
import {
   VALID_COMPANY_TYPES,
   VALID_DEPARTMENTS,
   VALID_INDUSTRIES,
   VALID_LOCATIONS,
   VALID_MANAGEMENT_LEVELS,
   VALID_SIZE_RANGES
} from "../types/types";

/**
 * High-level search interface for the Coresignal Clean Employee index.
 *
 * This module exposes a single, preferred layer:
 *
 * 1. **Simple FilterSpec API for AI agents and internal code**
 *    - `CleanEmployeeFilterSpecSchema` + `buildEsQueryFromFilterSpec`
 *    - Extremely small, easy-to-remember interface for the model.
 *    - Handles nested paths automatically using the ES mapping.
 *
 * The key idea: **LLMs never emit raw ES DSL** — only FilterSpec. All DSL is
 * produced here in a controlled, deterministic way using the mapping we already have.
 */

export type CleanEmployeeSearchOptions = {
   limit?: number;
   after?: string | null;
};

const {
   buildTextAnyClause,
   buildTextAllClause,
   buildRangeClause,
   buildTermsAnyClause,
   buildTermsAllClause,
   buildExistsClause,
   buildNotExistsClause,
   buildEsQueryFromClauses,
   getNestedPath: getNestedPathFromBase
} = createEsQueryLibraryBase(CLEAN_EMPLOYEE_FIELD_REGISTRY);

/**
 * ---------------------------------------------------------
 * FilterSpec API (recommended surface for AI tooling)
 * ---------------------------------------------------------
 */

export type { ESQuery };

export type CleanEmployeeFilterTextAny = {
   /** ES field path, e.g. "headline", "experience.description", etc. */
   field: CleanEmployeeFieldKey;
   /** Any of these terms may match (logical OR). */
   terms: string[];
};

export type CleanEmployeeFilterTextAll = {
   /** ES field path, e.g. "headline", "experience.description", etc. */
   field: CleanEmployeeFieldKey;
   /** All of these terms must match (logical AND). */
   terms: string[];
};

export type CleanEmployeeFilterRange = {
   /** ES field path, e.g. "experience.company_size_employees_count". */
   field: CleanEmployeeFieldKey;
   gte?: number;
   lte?: number;
};

export type CleanEmployeeFilterTermsAny = {
   /** ES field path, e.g. "location_regions", "experience.company_id", etc. */
   field: CleanEmployeeFieldKey;
   /** Any of these values may match (ES `terms` query). */
   values: (string | number | boolean)[];
};

export type CleanEmployeeFilterTermsAll = {
   /** ES field path where every value must match (modeled as multiple `term` queries in a bool.must). */
   field: CleanEmployeeFieldKey;
   values: (string | number | boolean)[];
};

export type CleanEmployeeFilterExists = {
   /** ES field path that must (or must not) exist on the document. */
   field: CleanEmployeeFieldKey;
};

export type CleanEmployeeFilterSpec = {
   /**
    * For each entry: match ANY of the provided text terms on a single field.
    * Internally compiled as a bool.should of match queries with minimum_should_match=1.
    */
   textAny?: CleanEmployeeFilterTextAny[];

   /**
    * For each entry: match ALL of the provided text terms on a single field.
    * Internally compiled as a bool.must of match queries.
    */
   textAll?: CleanEmployeeFilterTextAll[];

   /**
    * Numeric range filters (gte/lte). Typical for counts, years, etc.
    */
   range?: CleanEmployeeFilterRange[];

   /**
    * Any-of semantics over discrete values (ES `terms` query).
    */
   termsAny?: CleanEmployeeFilterTermsAny[];

   /**
    * All-of semantics over discrete values (modeled as bool.must of term queries).
    */
   termsAll?: CleanEmployeeFilterTermsAll[];

   /**
    * Field existence filters (ES `exists` query). Use this when a field must be present.
    */
   exists?: CleanEmployeeFilterExists[];

   /**
    * Field non-existence filters (ES `bool.must_not` + `exists` query). Use this when a field must be missing/null.
    */
   notExists?: CleanEmployeeFilterExists[];
};

const FilterFieldSchema = CleanEmployeeFieldEnum;

// Define the base field filter schema once to avoid duplication
const FieldFilterSchema = z.object({
   field: FilterFieldSchema.describe(
      "ES field path (including nested paths like experience.company_id) to apply the filter on."
   )
});

// Fields whose values are backed by explicit CoreSignal enums.
const ENUM_FIELD_VALUE_SETS: Record<string, readonly string[]> = {
   // Top-level profile fields
   department: VALID_DEPARTMENTS,
   management_level: VALID_MANAGEMENT_LEVELS,
   location_regions: VALID_LOCATIONS,
   company_type: VALID_COMPANY_TYPES,
   company_size_range: VALID_SIZE_RANGES,
   company_industry: VALID_INDUSTRIES,

   // Nested experience fields
   "experience.department": VALID_DEPARTMENTS,
   "experience.management_level": VALID_MANAGEMENT_LEVELS,
   "experience.company_type": VALID_COMPANY_TYPES,
   "experience.company_size_range": VALID_SIZE_RANGES,
   "experience.company_industry": VALID_INDUSTRIES,
   "experience.company_location_hq_regions": VALID_LOCATIONS
} as const;

type EnumBackedFieldKey = keyof typeof ENUM_FIELD_VALUE_SETS;

/**
 * Zod enums for the CoreSignal-backed value sets, so that JSON Schema generation
 * can surface concrete `enum` lists for the model.
 *
 * NOTE: we only materialize enums for the value *sets* here; the fields themselves
 * are discriminated via string literals on `field`.
 */
const DepartmentEnum = z.enum(VALID_DEPARTMENTS as [string, ...string[]]);
const ManagementLevelEnum = z.enum(VALID_MANAGEMENT_LEVELS as [string, ...string[]]);
const LocationRegionEnum = z.enum(VALID_LOCATIONS as [string, ...string[]]);
const CompanyTypeEnum = z.enum(VALID_COMPANY_TYPES as [string, ...string[]]);
const CompanySizeRangeEnum = z.enum(VALID_SIZE_RANGES as [string, ...string[]]);
const CompanyIndustryEnum = z.enum(VALID_INDUSTRIES as [string, ...string[]]);

/**
 * Generic "terms" value schema used for non-enum-backed fields.
 */
const GenericTermsValuesSchema = z
   .array(z.union([z.string(), z.number(), z.boolean()]))
   .min(1)
   .describe(
      "List of allowed values for **exact matching**; at least one must match. For enum-backed fields, the model should instead use the dedicated enum-constrained variants for this field."
   );

/**
 * Helper: schema for terms filters on non-enum fields. We explicitly *exclude*
 * enum-backed fields via a refinement so that they can only go through the
 * enum-constrained discriminated union branches.
 */
const NonEnumFieldFilterSchema = FieldFilterSchema.extend({
   field: FilterFieldSchema.refine(
      (field): field is Exclude<EnumBackedFieldKey, never> => !(field in ENUM_FIELD_VALUE_SETS),
      {
         message:
            "Enum-backed fields must use the dedicated enum-constrained variants; see helper tools like get_industries, get_size_ranges, get_locations, get_management_levels, get_departments, get_company_types."
      }
   )
});

/**
 * Discriminated-union branches for enum-backed fields for ANY-of semantics.
 * Each branch fixes `field` to a literal and constrains `values` to the
 * appropriate enum, so JSON Schema exposes `enum` for both.
 */
const EnumTermsAnyEntrySchema = z.discriminatedUnion("field", [
   // Top-level profile fields
   FieldFilterSchema.extend({
      field: z.literal("department"),
      values: z
         .array(DepartmentEnum)
         .min(1)
         .describe(
            "List of allowed department values; at least one must match. Valid options come from the predefined departments list (see get_departments)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("management_level"),
      values: z
         .array(ManagementLevelEnum)
         .min(1)
         .describe(
            "List of allowed management level values; at least one must match. Valid options come from the predefined management levels list (see get_management_levels)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("location_regions"),
      values: z
         .array(LocationRegionEnum)
         .min(1)
         .describe(
            "List of allowed location region values; at least one must match. Valid options come from the predefined locations list (see get_locations)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_type"),
      values: z
         .array(CompanyTypeEnum)
         .min(1)
         .describe(
            "List of allowed company type values; at least one must match. Valid options come from the predefined company types list (see get_company_types)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_size_range"),
      values: z
         .array(CompanySizeRangeEnum)
         .min(1)
         .describe(
            "List of allowed company size range values; at least one must match. Valid options come from the predefined size ranges list (see get_size_ranges)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_industry"),
      values: z
         .array(CompanyIndustryEnum)
         .min(1)
         .describe(
            "List of allowed industry values; at least one must match. Valid options come from the predefined industries list (see get_industries)."
         )
   }),

   // Nested experience fields
   FieldFilterSchema.extend({
      field: z.literal("experience.department"),
      values: z
         .array(DepartmentEnum)
         .min(1)
         .describe(
            "List of allowed experience.department values; at least one must match. Valid options come from the predefined departments list (see get_departments)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.management_level"),
      values: z
         .array(ManagementLevelEnum)
         .min(1)
         .describe(
            "List of allowed experience.management_level values; at least one must match. Valid options come from the predefined management levels list (see get_management_levels)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_type"),
      values: z
         .array(CompanyTypeEnum)
         .min(1)
         .describe(
            "List of allowed experience.company_type values; at least one must match. Valid options come from the predefined company types list (see get_company_types)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_size_range"),
      values: z
         .array(CompanySizeRangeEnum)
         .min(1)
         .describe(
            "List of allowed experience.company_size_range values; at least one must match. Valid options come from the predefined size ranges list (see get_size_ranges)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_industry"),
      values: z
         .array(CompanyIndustryEnum)
         .min(1)
         .describe(
            "List of allowed experience.company_industry values; at least one must match. Valid options come from the predefined industries list (see get_industries)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_location_hq_regions"),
      values: z
         .array(LocationRegionEnum)
         .min(1)
         .describe(
            "List of allowed experience.company_location_hq_regions values; at least one must match. Valid options come from the predefined locations list (see get_locations)."
         )
   })
] as const);

/**
 * Equivalent discriminated-union branches for enum-backed fields for ALL-of
 * semantics.
 */
const EnumTermsAllEntrySchema = z.discriminatedUnion("field", [
   // Top-level profile fields
   FieldFilterSchema.extend({
      field: z.literal("department"),
      values: z
         .array(DepartmentEnum)
         .min(1)
         .describe(
            "List of department values; ALL must match on this field. Valid options come from the predefined departments list (see get_departments)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("management_level"),
      values: z
         .array(ManagementLevelEnum)
         .min(1)
         .describe(
            "List of management level values; ALL must match on this field. Valid options come from the predefined management levels list (see get_management_levels)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("location_regions"),
      values: z
         .array(LocationRegionEnum)
         .min(1)
         .describe(
            "List of location region values; ALL must match on this field. Valid options come from the predefined locations list (see get_locations)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_type"),
      values: z
         .array(CompanyTypeEnum)
         .min(1)
         .describe(
            "List of company type values; ALL must match on this field. Valid options come from the predefined company types list (see get_company_types)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_size_range"),
      values: z
         .array(CompanySizeRangeEnum)
         .min(1)
         .describe(
            "List of company size range values; ALL must match on this field. Valid options come from the predefined size ranges list (see get_size_ranges)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("company_industry"),
      values: z
         .array(CompanyIndustryEnum)
         .min(1)
         .describe(
            "List of industry values; ALL must match on this field. Valid options come from the predefined industries list (see get_industries)."
         )
   }),

   // Nested experience fields
   FieldFilterSchema.extend({
      field: z.literal("experience.department"),
      values: z
         .array(DepartmentEnum)
         .min(1)
         .describe(
            "List of experience.department values; ALL must match on this field. Valid options come from the predefined departments list (see get_departments)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.management_level"),
      values: z
         .array(ManagementLevelEnum)
         .min(1)
         .describe(
            "List of experience.management_level values; ALL must match on this field. Valid options come from the predefined management levels list (see get_management_levels)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_type"),
      values: z
         .array(CompanyTypeEnum)
         .min(1)
         .describe(
            "List of experience.company_type values; ALL must match on this field. Valid options come from the predefined company types list (see get_company_types)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_size_range"),
      values: z
         .array(CompanySizeRangeEnum)
         .min(1)
         .describe(
            "List of experience.company_size_range values; ALL must match on this field. Valid options come from the predefined size ranges list (see get_size_ranges)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_industry"),
      values: z
         .array(CompanyIndustryEnum)
         .min(1)
         .describe(
            "List of experience.company_industry values; ALL must match on this field. Valid options come from the predefined industries list (see get_industries)."
         )
   }),
   FieldFilterSchema.extend({
      field: z.literal("experience.company_location_hq_regions"),
      values: z
         .array(LocationRegionEnum)
         .min(1)
         .describe(
            "List of experience.company_location_hq_regions values; ALL must match on this field. Valid options come from the predefined locations list (see get_locations)."
         )
   })
] as const);

/**
 * Range entry schema with a special-case branch for `connections_count` so we
 * can enforce the 500 cap at the type level instead of via superRefine.
 */
const RangeEntrySchema = z.discriminatedUnion("field", [
   // Special-cased connections_count: enforce <= 500 for both gte and lte
   FieldFilterSchema.extend({
      field: z.literal("connections_count"),
      gte: z
         .number()
         .max(500, "connections_count is capped at 500 in Coresignal; the minimum (gte) cannot be greater than 500.")
         .optional(),
      lte: z
         .number()
         .max(500, "connections_count is capped at 500 in Coresignal; the maximum (lte) cannot be greater than 500.")
         .optional()
   }),
   // Generic range branch for all other numeric fields
   FieldFilterSchema.extend({
      field: CleanEmployeeFieldEnum.exclude(["connections_count"] as any),
      gte: z.number().optional(),
      lte: z.number().optional()
   })
] as const);

export const CleanEmployeeFilterSpecSchema = z
   .object({
      textAny: z
         .array(
            FieldFilterSchema.extend({
               terms: z
                  .array(z.string().min(1))
                  .min(1)
                  .describe("List of text terms; at least one must match on this field.")
            })
         )
         .optional()
         .describe(
            "Use for **partial / fuzzy matching** on free-text fields (e.g. job titles, descriptions, headlines). Matches if the field *contains* the words. Do NOT use for enum fields."
         ),
      textAll: z
         .array(
            FieldFilterSchema.extend({
               terms: z.array(z.string().min(1)).min(1).describe("List of text terms; ALL must match on this field.")
            })
         )
         .optional()
         .describe(
            "Use for **partial / fuzzy matching** where ALL terms must be present in the field. Matches if the field *contains* all the words."
         ),
      range: z
         .array(RangeEntrySchema)
         .optional()
         .describe(
            "Array of numeric range filters. Use gte and/or lte to bound the field. At least one of gte or lte should be provided. IMPORTANT: For LinkedIn connections counts (the connections_count field), Coresignal caps the value at 500, so you should treat 500 as the practical maximum when constructing filters (e.g., use ranges like 100–500 rather than values above 500)."
         ),
      termsAny: z
         .array(
            z.union([
               // Enum-backed fields: discriminated by `field` with enum-constrained values.
               EnumTermsAnyEntrySchema,
               // Non-enum fields: generic value support, but explicitly excludes enum-backed fields.
               NonEnumFieldFilterSchema.extend({
                  values: GenericTermsValuesSchema
               })
            ])
         )
         .optional()
         .describe(
            "Use for **exact matching** of specific values (e.g. IDs, categories, exact names). The field must match the value *exactly*. REQUIRED for all enum-backed fields (industry, location, etc.)."
         ),
      termsAll: z
         .array(
            z.union([
               // Enum-backed fields: discriminated by `field` with enum-constrained values.
               EnumTermsAllEntrySchema,
               // Non-enum fields: generic value support, but explicitly excludes enum-backed fields.
               NonEnumFieldFilterSchema.extend({
                  values: GenericTermsValuesSchema.describe(
                     "List of values; ALL must match on this field. For enum-backed fields, use the dedicated enum-constrained variants."
                  )
               })
            ])
         )
         .optional()
         .describe(
            "Use for **exact matching** where the field must match ALL values (e.g. a list of tags). REQUIRED for all enum-backed fields."
         ),
      exists: z
         .array(FieldFilterSchema)
         .optional()
         .describe(
            "Array of field-existence filters. Each entry requires that the given field is present (non-null and indexed) on the document. Useful for ensuring a field is populated before applying other logic."
         ),
      notExists: z
         .array(FieldFilterSchema)
         .optional()
         .describe(
            "Array of field non-existence filters. Each entry requires that the given field is missing or null. For nested fields (e.g. experience.date_to), this is compiled into a nested bool.must_not + exists query."
         )
   })
   .meta({
      /**
       * All ES field paths that are valid for Clean Employee filters.
       * Tooling and prompting layers should use this to decide which `field`
       * values to expose to the model.
       */
      allowedFields: CLEAN_EMPLOYEE_FIELD_KEYS,
      /**
       * For enum-backed fields, expose the allowed option lists so tools and
       * prompting layers can surface them (and functions like get_industries,
       * get_size_ranges, get_locations, etc. can be aligned).
       */
      enumFieldOptions: ENUM_FIELD_VALUE_SETS
   })
   .describe(
      "Simple, easy-to-remember filter specification for the Coresignal Clean Employee index. The model only needs to choose fields and values; nested paths are detected automatically based on the ES mapping. For certain fields (department, management_level, company_type, company_size_range, company_industry, location_regions, and their experience.* variants), values MUST come from predefined enum lists."
   );

/**
 * Field-specific normalization for enum / terms-style values before emitting ES DSL.
 *
 * - cleanEmployee.location_regions is stored in ES wrapped in curly braces, e.g. "{Americas}".
 *   However, our VALID_LOCATIONS set (and tools like get_locations) expose plain values
 *   like "Americas". To keep the public API clean while still matching ES correctly,
 *   we transparently wrap plain location region values in braces here.
 *
 *   IMPORTANT: We only do this for the top-level location_regions field; other location
 *   fields (e.g., experience.company_location_hq_regions) use normal, non-braced values.
 */
function normalizeValuesForEs(field: string, values: TermsValue[]): TermsValue[] {
   if (field === "location_regions") {
      return values.map((v) => {
         if (typeof v !== "string") return v;
         // If the caller already passed a braced value, keep it as-is.
         if (v.startsWith("{") && v.endsWith("}")) return v;
         return `{${v}}`;
      });
   }

   return values;
}

/**
 * Build an ES DSL query from a simple FilterSpec. All filters are placed in
 * a top-level bool.filter array.
 */
export function buildEsQueryFromFilterSpec(spec: CleanEmployeeFilterSpec): ESQuery {
   const validated = CleanEmployeeFilterSpecSchema.parse(spec) as CleanEmployeeFilterSpec;
   const clauses: ReturnType<typeof buildTextAnyClause>[] = [];

   if (validated.textAny) {
      for (const entry of validated.textAny) {
         clauses.push(buildTextAnyClause(entry.field, entry.terms));
      }
   }

   if (validated.textAll) {
      for (const entry of validated.textAll) {
         clauses.push(buildTextAllClause(entry.field, entry.terms));
      }
   }

   if (validated.range) {
      for (const entry of validated.range) {
         clauses.push(buildRangeClause(entry.field, entry.gte, entry.lte));
      }
   }

   if (validated.termsAny) {
      for (const entry of validated.termsAny) {
         const normalizedValues = normalizeValuesForEs(entry.field, entry.values);
         clauses.push(buildTermsAnyClause(entry.field, normalizedValues));
      }
   }

   if (validated.termsAll) {
      for (const entry of validated.termsAll) {
         const normalizedValues = normalizeValuesForEs(entry.field, entry.values);
         clauses.push(buildTermsAllClause(entry.field, normalizedValues));
      }
   }

   if (validated.exists) {
      for (const entry of validated.exists) {
         clauses.push(buildExistsClause(entry.field));
      }
   }

   if (validated.notExists) {
      for (const entry of validated.notExists) {
         clauses.push(buildNotExistsClause(entry.field));
      }
   }

   return buildEsQueryFromClauses(clauses);
}

/**
 * Convenience helper: build a full search payload directly from FilterSpec.
 */
export function createCleanEmployeeSearchPayloadFromFilterSpec(
   spec: CleanEmployeeFilterSpec,
   options: CleanEmployeeSearchOptions = {}
): CleanEmployeeSearchPayload {
   return {
      esBody: buildEsQueryFromFilterSpec(spec),
      limit: options.limit,
      after: options.after ?? null
   };
}

/**
 * Re-export helper for manual nested path lookups if needed by tests or older code
 */
export const getNestedPath = getNestedPathFromBase;

export function maybeWrapNested(field: string, inner: ESQuery): ESQuery {
   const nestedPath = getNestedPath(field);
   if (!nestedPath) return inner;

   return {
      nested: {
         path: nestedPath,
         query: inner
      }
   };
}

export type CleanEmployeeSearchPayload = {
   esBody: Record<string, any>;
   limit?: number;
   after?: string | null;
};
