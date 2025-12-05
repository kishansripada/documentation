import { NonRetriableError } from "inngest";

import { createCancellableFunction } from "@/app/spreadsheets/inngest/cancelInngestHelpers";
import { supabaseFunctionCache } from "@/inngest/supabaseFunctionCache";
import {
   coresignalCleanEmployeeCostLogger,
   coresignalCleanEmployeeSearchCostLogger
} from "@/inngest/utils/costLoggers";
import { creditsMiddleware } from "@/inngest/utils/credits/creditsMiddleware";

import { CleanCoresignalEmployee } from "../types/cleanEmployeeType";

const CORESIGNAL_BASE = "https://api.coresignal.com/cdapi/v2";
const TOKEN = process.env.CORESIGNAL_API_KEY;

export const coresignalCleanEmployeeSearchInngest = createCancellableFunction(
   {
      id: "coresignal/clean-employee-search",
      throttle: { limit: 15, period: "1s" },
      concurrency: { limit: 15, key: "coresignal-employee-search" },
      middleware: [creditsMiddleware, coresignalCleanEmployeeSearchCostLogger]
   },
   { event: "coresignal/clean-employee-search" },
   async ({ event, step }) => {
      const {
         esBody,
         limit = 100,
         after
      } = event.data as {
         esBody: object;
         limit?: number;
         after?: string | null;
      };

      if (!TOKEN) {
         throw new Error("CORESIGNAL_API_KEY is not set");
      }

      const allEmployeeIds: number[] = [];
      let nextPageAfter: string | null = after ?? null;
      let totalResults: number | null = null;

      while (true) {
         const remaining = limit !== undefined ? limit - allEmployeeIds.length : undefined;
         if (remaining !== undefined && remaining <= 0) break;

         const pageSize = remaining !== undefined ? Math.min(1000, remaining) : 1000;

         const url = nextPageAfter
            ? `${CORESIGNAL_BASE}/employee_clean/search/es_dsl?items_per_page=${pageSize}&after=${nextPageAfter}`
            : `${CORESIGNAL_BASE}/employee_clean/search/es_dsl?items_per_page=${pageSize}`;

         const res = await step.fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: `${TOKEN}` },
            body: JSON.stringify(esBody ?? {})
         });

         if (res.status >= 400 && res.status < 500) {
            throw new NonRetriableError(`ES search non-retriable error: ${res.status}`);
         }

         if (!res.ok) throw new Error(`ES search failed: ${res.status}`);

         const employeeIds: number[] = await res.json();
         allEmployeeIds.push(...employeeIds);

         nextPageAfter = res.headers.get("x-next-page-after");
         totalResults = res.headers.get("x-total-results") ? Number(res.headers.get("x-total-results")) : null;

         if (!nextPageAfter || nextPageAfter === "None") break;
         if (limit !== undefined && allEmployeeIds.length >= limit) break;
      }

      return {
         employeeIds: allEmployeeIds,
         nextPageAfter: nextPageAfter && nextPageAfter !== "None" ? nextPageAfter : null,
         totalResults
      };
   }
);

export const coresignalCleanEmployeeCollectInngest = createCancellableFunction(
   {
      id: "coresignal/clean-employee-collect"
   },
   { event: "coresignal/clean-employee-collect" },
   async ({ event, step, invoke }) => {
      const { id, url, username } = event.data;

      if (id !== undefined && id !== null && `${id}`.trim().length > 0) {
         return await invoke("coresignal/clean-employee-collect", {
            target: coresignalCleanEmployeeFetchByIdInngest,
            data: { id }
         });
      }

      if (url || username) {
         return await invoke("coresignal/clean-employee-fetch-by-slug", {
            target: coresignalCleanEmployeeFetchBySlug,
            data: { url, username }
         });
      }

      throw new NonRetriableError("Provide one of: id, url, or username");
   }
);

export const coresignalCleanEmployeeFetchByIdInngest = createCancellableFunction(
   {
      id: "coresignal/clean-employee-fetch-by-id",
      throttle: { limit: 50, period: "1s", key: "coresignal-employee-collect" },
      concurrency: { limit: 50, key: "coresignal-employee-collect", scope: "account" },
      middleware: [creditsMiddleware, coresignalCleanEmployeeCostLogger]
   },
   { event: "coresignal/clean-employee-fetch-by-id" },
   async ({ event, step, cache }) => {
      // if (cache?.hit) return cache.value;
      const { id } = event.data;

      if (!TOKEN) {
         throw new Error("CORESIGNAL_API_KEY is not set");
      }
      const url = `${CORESIGNAL_BASE}/employee_clean/collect/${id}`;

      const res = await step.fetch(url, {
         method: "GET",
         headers: { apikey: `${TOKEN}`, accept: "application/json" }
      });
      if (res.status === 404) {
         throw new NonRetriableError(`Employee not found: ${id}`);
      }
      if (!res.ok) throw new Error(`Collect failed: ${res.status}`);

      const json = await res.json();

      if (
         json.message &&
         typeof json.message === "string" &&
         json.message.toLowerCase().includes("rate limit exceed")
      ) {
         throw new Error(`Rate limit exceeded: ${id}`);
      }

      return json as CleanCoresignalEmployee;
   }
);

export const coresignalCleanEmployeeFetchBySlug = createCancellableFunction(
   {
      id: "coresignal/clean-employee-fetch-by-slug",
      throttle: { limit: 50, period: "1s", key: "coresignal-employee-collect" },
      concurrency: { limit: 50, key: "coresignal-employee-collect" },
      middleware: [creditsMiddleware, coresignalCleanEmployeeCostLogger]
      // middleware: [supabaseFunctionCache],
   },
   { event: "coresignal/clean-employee-fetch-by-slug" },
   async ({ event, step, invoke, sendEvent, cache }) => {
      const { url, username } = event.data;
      if (cache?.hit) return cache.value;

      // Determine the actual URL to use
      const profileUrl = url || (username ? `https://linkedin.com/in/${username}` : null);
      if (!profileUrl) {
         throw new Error("Either url or username must be provided");
      }

      const apiKey = process.env.CORESIGNAL_API_KEY;
      if (!apiKey) throw new Error("Missing CORESIGNAL_API_KEY");

      // get the /in/<slug> part and normalize it
      const u = new URL(profileUrl.trim());
      // Remove query params and hash
      u.search = "";
      u.hash = "";
      const parts = u.pathname.split("/").filter(Boolean);
      const inIdx = parts.findIndex((p) => p.toLowerCase() === "in");
      if (inIdx === -1 || !parts[inIdx + 1]) {
         throw new NonRetriableError("Not a valid LinkedIn person URL");
      }
      const shorthand = decodeURIComponent(parts[inIdx + 1]?.replace(/\/+$/, "") ?? "");

      const endpoint = `https://api.coresignal.com/cdapi/v2/employee_clean/collect/${encodeURIComponent(shorthand)}`;

      const res = await step.fetch(endpoint, {
         method: "GET",
         headers: { accept: "application/json", apikey: apiKey }
      });

      if (res.status === 200) return (await res.json()) as CleanCoresignalEmployee;
      if (res.status === 404) return null; // not found
      if (res.status === 429) {
         throw new Error(`Rate limit exceeded for ${shorthand}`);
      }

      throw new NonRetriableError(
         `Coresignal error ${res.status}: ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`
      );
   }
);
