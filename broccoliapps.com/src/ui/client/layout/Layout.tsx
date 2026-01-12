import type { ComponentChildren } from "preact";
import { Header } from "./Header";
import { Footer } from "./Footer";

type LayoutProps = {
  children: ComponentChildren;
  skip?: boolean;
};

export const Layout = ({ children, skip = false }: LayoutProps) => {
  if (skip) {
    return <>{children}</>;
  }

  return (
    <div class="layout">
      <Header />
      <main class="main-content">{children}</main>
      <Footer />
    </div>
  );
};
