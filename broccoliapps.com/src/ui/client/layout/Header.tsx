import { cognitoClient } from "@broccoliapps/browser";

export const Header = () => {
  const handleSignIn = () => {
    cognitoClient.signInWith("google", "broccoliapps");
  };

  return (
    <header class="header">
      <a href="/" class="logo">
        <span class="logo-text">Broccoli Apps</span>
      </a>
    </header>
  );
};
