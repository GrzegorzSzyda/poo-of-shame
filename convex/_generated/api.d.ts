/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as common_access from "../common/access.js";
import type * as common_errors from "../common/errors.js";
import type * as domain_games_constants from "../domain/games/constants.js";
import type * as domain_games_index from "../domain/games/index.js";
import type * as domain_games_rules from "../domain/games/rules.js";
import type * as domain_games_types from "../domain/games/types.js";
import type * as domain_library_constants from "../domain/library/constants.js";
import type * as domain_library_index from "../domain/library/index.js";
import type * as domain_library_rules from "../domain/library/rules.js";
import type * as domain_library_types from "../domain/library/types.js";
import type * as domain_library_validators from "../domain/library/validators.js";
import type * as games from "../games.js";
import type * as library from "../library.js";
import type * as repositories_games from "../repositories/games.js";
import type * as repositories_library from "../repositories/library.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "common/access": typeof common_access;
  "common/errors": typeof common_errors;
  "domain/games/constants": typeof domain_games_constants;
  "domain/games/index": typeof domain_games_index;
  "domain/games/rules": typeof domain_games_rules;
  "domain/games/types": typeof domain_games_types;
  "domain/library/constants": typeof domain_library_constants;
  "domain/library/index": typeof domain_library_index;
  "domain/library/rules": typeof domain_library_rules;
  "domain/library/types": typeof domain_library_types;
  "domain/library/validators": typeof domain_library_validators;
  games: typeof games;
  library: typeof library;
  "repositories/games": typeof repositories_games;
  "repositories/library": typeof repositories_library;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
