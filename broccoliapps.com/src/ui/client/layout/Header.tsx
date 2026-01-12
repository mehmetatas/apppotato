import { route } from "preact-router";

export const Header = () => {
  const handleNavClick = (e: Event, href: string) => {
    e.preventDefault();
    route(href);
  };

  return (
    <header class="header">
      <a href="/" class="logo" onClick={(e) => handleNavClick(e, "/")}>
        <span class="logo-text">Broccoli Apps</span>
      </a>
      <nav class="nav">
        <a href="/" onClick={(e) => handleNavClick(e, "/")}>
          Home
        </a>
        <a href="/users" onClick={(e) => handleNavClick(e, "/users")}>
          Users
        </a>
        <a href="/api-test" onClick={(e) => handleNavClick(e, "/api-test")}>
          API Test
        </a>
      </nav>
    </header>
  );
};
