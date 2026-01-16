import type { ComponentChildren } from "preact";
import { Footer } from "./Footer";
import { Header } from "./Header";

type LayoutProps = {
  children: ComponentChildren;
  skip?: boolean;
};

export const Layout = ({ children, skip = false }: LayoutProps) => {
  if (skip) {
    return <>{children}</>;
  }

  return (
    <div class="flex flex-col min-h-screen bg-linear-to-br from-slate-50 to-slate-200">
      <Header />
      <main class="flex-1 p-8 max-w-6xl mx-auto w-full">{children}</main>
      <Footer />
    </div>
  );
};
