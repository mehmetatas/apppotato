import { route } from "preact-router";

export const NotFoundPage = () => {
  const handleClick = (e: Event) => {
    e.preventDefault();
    route("/");
  };

  return (
    <div class="not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" onClick={handleClick}>
        Go back home
      </a>
    </div>
  );
};
