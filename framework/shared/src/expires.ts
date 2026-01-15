import { epoch } from "./epoch";

export const isExpired = ({ expiresAt }: { expiresAt: number }) => expiresAt < epoch.millis();
