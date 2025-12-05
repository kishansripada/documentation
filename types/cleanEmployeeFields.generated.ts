// Runtime field registry for the Clean Employee ES mapping.
// -----------------------------------------------------------------------------
// This module derives the set of valid field paths directly from
// `cleanEmployeeEsMapping.ts` at runtime and exposes:
// - `CleanEmployeeFieldEnum` (Zod enum of all field paths)
// - `CleanEmployeeFieldKey` (corresponding TS type)
// - `CLEAN_EMPLOYEE_FIELD_KEYS` (flat list of keys)
// - `CLEAN_EMPLOYEE_FIELD_REGISTRY` (metadata per field)
//
// `cleanEmployeeEsMapping` remains the single source of truth; update it to
// add/remove fields. This file should not be edited by hand.

import { z } from "zod";

import { cleanEmployeeEsMapping } from "./cleanEmployeeEsMapping";
import {
   buildEsFieldRegistry,
   createFieldEnum,
   getSortedRegistryKeys,
   type EsFieldConfig,
   type EsFieldMeta,
} from "../shared/esFieldRegistry";

type CleanEmployeeFieldMeta = EsFieldMeta;

const esProperties = cleanEmployeeEsMapping.mappings.properties as Record<string, EsFieldConfig>;

export const CLEAN_EMPLOYEE_FIELD_REGISTRY = buildEsFieldRegistry(esProperties);

export const CLEAN_EMPLOYEE_FIELD_KEYS = getSortedRegistryKeys(CLEAN_EMPLOYEE_FIELD_REGISTRY);

export const CleanEmployeeFieldEnum = createFieldEnum(CLEAN_EMPLOYEE_FIELD_KEYS);

export type CleanEmployeeFieldKey = z.infer<typeof CleanEmployeeFieldEnum>;

export type { CleanEmployeeFieldMeta };
