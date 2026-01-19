import { api } from "@broccoliapps/shared";
import * as v from "valibot";
import type { Account, HistoryItem } from "../../db/accounts";

// POST /accounts - create account with history items
export const postAccount = api("POST", "/accounts")
  .withRequest({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    type: v.picklist(["asset", "debt"]),
    currency: v.pipe(v.string(), v.minLength(1), v.maxLength(10)),
    historyItems: v.pipe(
      v.array(
        v.object({
          month: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}$/)),
          value: v.number(),
        })
      ),
      v.minLength(1)
    ),
  })
  .withResponse<Account>();

// GET /accounts - list all accounts
export const getAccounts = api("GET", "/accounts").withResponse<Account[]>();

// GET /accounts/:id - get single account
export const getAccount = api("GET", "/accounts/:id")
  .withRequest({
    id: v.string(),
  })
  .withResponse<Account>();

// DELETE /accounts/:id - delete account and all history
export const deleteAccount = api("DELETE", "/accounts/:id").withRequest({
  id: v.string(),
});

// PATCH /accounts/:id - update account
export const patchAccount = api("PATCH", "/accounts/:id")
  .withRequest({
    id: v.string(),
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  })
  .withResponse<Account>();

// GET /accounts/:id/history - get history items for account
export const getAccountHistory = api("GET", "/accounts/:id/history")
  .withRequest({
    id: v.string(),
  })
  .withResponse<HistoryItem[]>();

// PUT /accounts/:id/history - bulk update history items
export const putAccountHistory = api("PUT", "/accounts/:id/history")
  .withRequest({
    id: v.string(),
    items: v.array(
      v.object({
        month: v.pipe(v.string(), v.regex(/^\d{4}-\d{2}$/)),
        value: v.number(),
      })
    ),
  })
  .withResponse<Pick<HistoryItem, "month" | "value">[]>();
