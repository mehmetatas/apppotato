import { cognitoClient } from "@broccoliapps/browser";

export const Header = () => {
  const handleSignIn = () => {
    cognitoClient.signInWith("google", "broccoliapps");
  };

  return (
    <header class="header">
      <a href="/" class="logo">
        <img src="/static/logo.png" alt="Broccoli Apps" class="logo-img" />
        <span class="logo-text">Broccoli Apps</span>
      </a>
      <nav class="nav">
        <a href="#apps">Apps</a>
      </nav>
    </header>
  );
};
