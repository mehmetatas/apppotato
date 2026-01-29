import { db } from "@broccoliapps/backend";
import { random } from "@broccoliapps/shared";

export async function getOrCreateUser(email: string, name: string) {
  // Look up by email
  const existingUsers = await db.broccoliapps.users.query.byEmail({ email }).limit(1).execute();
  const existing = existingUsers.items[0];

  if (existing) {
    return existing;
  }

  // Create new user
  const now = Date.now();
  return db.broccoliapps.users.put({
    id: random.id(),
    email,
    name,
    createdAt: now,
    updatedAt: now,
  });
}
