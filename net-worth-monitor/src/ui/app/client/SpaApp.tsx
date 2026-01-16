import type { ComponentType } from "preact";
import Router, { type RoutableProps } from "preact-router";
import { Layout } from "./layout/Layout";
import { HomePage } from "./pages";

// Route component that wraps page with Layout based on withLayout prop
const Route = ({
  page: Page,
  ...routeParams
}: RoutableProps & {
  page: ComponentType<any>;
}) => (
  <Layout>
    <Page {...routeParams} />
  </Layout>
);

export const App = () => {
  return (
    <Router>
      <Route path="/app" page={HomePage} />
    </Router>
  );
};
