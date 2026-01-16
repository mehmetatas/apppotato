import { globalConfig } from "@broccoliapps/shared";

export type HomeProps = {
  title: string;
};

export const HomePage = ({ title }: HomeProps) => {
  return (
    <div class="flex flex-col items-center justify-center text-center py-16 px-8">
      <h1 class="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
      <p class="text-xl text-slate-600 mb-6 font-medium">Track and monitor your net worth over time.</p>
      <p class="text-base text-slate-500 leading-7 max-w-xl">
        Get a comprehensive view of your financial health by tracking your assets, liabilities, and net worth
        progression.
      </p>
      <div class="py-12">
        <button
          class="border bg-white px-3 py1.5"
          onClick={() =>
            (window.location.href = `${globalConfig.apps["broccoliapps-com"].baseUrl}/auth?app=networthmonitor&provider=google`)
          }
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};
