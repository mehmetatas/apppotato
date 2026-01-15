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
      <nav class="nav">
        <a href="/">Home</a>
      </nav>
      <button class="sign-in-btn" onClick={handleSignIn}>
        Sign in with Google
      </button>
    </header>
  );
};
