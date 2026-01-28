import { UserMenu } from "./UserMenu";

export const Header = () => {
  return (
    <header class="py-4 px-4 bg-white/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <a href="/app" class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
          Tasquito
        </a>

        <UserMenu />
      </div>
    </header>
  );
};
