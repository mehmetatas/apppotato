import { HttpError } from "@broccoliapps/backend";
import { random } from "@broccoliapps/shared";
import { accounts, historyItems } from "../../db/accounts";
import {
  deleteAccount,
  getAccount,
  getAccountHistory,
  getAccounts,
  patchAccount,
  postAccount,
  putAccountHistory,
} from "../../shared/api-contracts";
import { api } from "../lambda";

// GET /accounts/:id/history - get history items (register most specific routes first)
api.register(getAccountHistory, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const account = await accounts.get({ userId }, { id: req.id });

  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  const items = await historyItems.query({ userId, accountId: req.id }).all();
  return res.ok(items);
});

// PUT /accounts/:id/history - bulk update history items
api.register(putAccountHistory, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const account = await accounts.get({ userId }, { id: req.id });

  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  // Get existing items to find which ones to delete
  const existingItems = await historyItems.query({ userId, accountId: req.id }).all();
  const newMonths = new Set(req.items.map((item) => item.month));

  // Delete items that are no longer in the list
  const itemsToDelete = existingItems.filter((item) => !newMonths.has(item.month));
  if (itemsToDelete.length > 0) {
    await historyItems.batchDelete(
      itemsToDelete.map((item) => ({
        pk: { userId, accountId: req.id },
        sk: { month: item.month },
      }))
    );
  }

  // Create/update history items
  const items = req.items.map((item) => ({
    userId,
    accountId: req.id,
    month: item.month,
    value: item.value,
  }));

  if (items.length > 0) {
    await historyItems.batchPut(items);
  }

  return res.ok(items);
});

// GET /accounts/:id - get single account
api.register(getAccount, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const account = await accounts.get({ userId }, { id: req.id });

  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  return res.ok(account);
});

// PATCH /accounts/:id - update account
api.register(patchAccount, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const account = await accounts.get({ userId }, { id: req.id });

  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  const updated = await accounts.put({
    ...account,
    name: req.name,
  });

  return res.ok(updated);
});

// DELETE /accounts/:id - delete account and all history
api.register(deleteAccount, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const account = await accounts.get({ userId }, { id: req.id });

  if (!account) {
    throw new HttpError(404, "Account not found");
  }

  // Delete all history items for this account
  const items = await historyItems.query({ userId, accountId: req.id }).all();
  if (items.length > 0) {
    await historyItems.batchDelete(
      items.map((item) => ({
        pk: { userId, accountId: req.id },
        sk: { month: item.month },
      }))
    );
  }

  await accounts.delete({ userId }, { id: req.id });
  return res.noContent();
});

// POST /accounts - create account with history items
api.register(postAccount, async (req, res, ctx) => {
  const { userId } = await ctx.getUser();
  const accountId = random.id();

  const account = await accounts.put({
    userId,
    id: accountId,
    name: req.name,
    type: req.type,
    currency: req.currency,
    createdAt: Date.now(),
  });

  // Create history items
  const items = req.historyItems.map((item) => ({
    userId,
    accountId,
    month: item.month,
    value: item.value,
  }));
  await historyItems.batchPut(items);

  return res.ok(account);
});

// GET /accounts - list all accounts
api.register(getAccounts, async (_, res, ctx) => {
  const { userId } = await ctx.getUser();
  const result = await accounts.query({ userId }).all();
  return res.ok(result);
});
