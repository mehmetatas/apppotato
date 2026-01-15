import { PageError } from "@broccoliapps/backend";

export const ErrorPage = ({ status, message, details }: PageError) => {
  return (
    <div class="not-found">
      <h1>{status}</h1>
      <p>{message}</p>
      {details && details.length > 0 && (
        <ul style={{ textAlign: "left", margin: "1rem auto", maxWidth: "400px" }}>
          {details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
      <a href="/">Go back home</a>
    </div>
  );
};
