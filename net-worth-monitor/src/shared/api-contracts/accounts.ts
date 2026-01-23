import { api } from "@broccoliapps/shared";
import {
  deleteAccountRequest,
  getAccountBucketsRequest,
  getAccountBucketsResponse,
  getAccountDetailRequest,
  getAccountDetailResponse,
  getAccountHistoryRequest,
  getAccountHistoryResponse,
  getAccountRequest,
  getAccountResponse,
  getAccountsResponse,
  patchAccountRequest,
  patchAccountResponse,
  postAccountRequest,
  postAccountResponse,
  putAccountBucketsRequest,
  putAccountHistoryRequest,
  putAccountHistoryResponse,
} from "./accounts.dto";

// POST /accounts - create account with history items
export const postAccount = api("POST", "/accounts")
  .withRequest(postAccountRequest)
  .withResponse(postAccountResponse);

// GET /accounts - list all accounts
export const getAccounts = api("GET", "/accounts")
  .withResponse(getAccountsResponse);

// GET /accounts/:id - get single account
export const getAccount = api("GET", "/accounts/:id")
  .withRequest(getAccountRequest)
  .withResponse(getAccountResponse);

// DELETE /accounts/:id - delete account and all history
export const deleteAccount = api("DELETE", "/accounts/:id")
  .withRequest(deleteAccountRequest);

// PATCH /accounts/:id - update account
export const patchAccount = api("PATCH", "/accounts/:id")
  .withRequest(patchAccountRequest)
  .withResponse(patchAccountResponse);

// GET /accounts/:id/history - get history items for account
export const getAccountHistory = api("GET", "/accounts/:id/history")
  .withRequest(getAccountHistoryRequest)
  .withResponse(getAccountHistoryResponse);

// PUT /accounts/:id/history - bulk update history items
export const putAccountHistory = api("PUT", "/accounts/:id/history")
  .withRequest(putAccountHistoryRequest)
  .withResponse(putAccountHistoryResponse);

// GET /accounts/:id/buckets - get buckets for an account
export const getAccountBuckets = api("GET", "/accounts/:id/buckets")
  .withRequest(getAccountBucketsRequest)
  .withResponse(getAccountBucketsResponse);

// PUT /accounts/:id/buckets - set buckets for an account
export const putAccountBuckets = api("PUT", "/accounts/:id/buckets")
  .withRequest(putAccountBucketsRequest);

// GET /accounts/:id/detail - get account with all related data
export const getAccountDetail = api("GET", "/accounts/:id/detail")
  .withRequest(getAccountDetailRequest)
  .withResponse(getAccountDetailResponse);
