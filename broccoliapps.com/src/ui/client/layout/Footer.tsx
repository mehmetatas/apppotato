export const Footer = () => {
  return (
    <footer class="footer">
      <p>&copy; {new Date().getFullYear()} Broccoli Apps. All rights reserved.</p>
      <nav class="footer-links">
        <a href="/about">About</a>
        <span class="separator">|</span>
        <a href="/privacy">Privacy</a>
        <span class="separator">|</span>
        <a href="/terms">Terms</a>
      </nav>
    </footer>
  );
};
