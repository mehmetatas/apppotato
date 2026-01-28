export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer class="py-6 px-8 text-center bg-white/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 text-sm">
      <p>&copy; {year} Tasquito. All rights reserved.</p>
    </footer>
  );
};
