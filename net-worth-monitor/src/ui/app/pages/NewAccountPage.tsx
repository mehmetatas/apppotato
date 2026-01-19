import { NewAccountForm, PageHeader } from "../components";

export const NewAccountPage = () => {
  return (
    <div>
      <PageHeader title="Add New" backHref="/" />
      <div class="max-w-xl mx-auto bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <NewAccountForm />
      </div>
    </div>
  );
};
