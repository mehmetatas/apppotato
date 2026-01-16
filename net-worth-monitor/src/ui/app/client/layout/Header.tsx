export const Header = () => {
  return (
    <header class="flex items-center justify-between px-8 py-4 bg-white/95 shadow-sm">
      <a href="/" class="no-underline">
        <span class="text-xl font-bold text-slate-900">Net Worth Monitor</span>
      </a>
      <nav class="flex gap-6">
        <a href="/" class="no-underline text-slate-500 font-medium hover:text-slate-900 transition-colors">
          Home
        </a>
      </nav>
    </header>
  );
};
