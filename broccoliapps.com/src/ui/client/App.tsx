import { Layout } from "./layout/Layout";

type AppProps = {
  pageProps: Record<string, unknown>;
  status: number;
  skipLayout?: boolean;
  children: preact.ComponentChildren;
};

export const App = ({ pageProps, status, skipLayout = false, children }: AppProps) => {
  return <Layout skip={skipLayout}>{children}</Layout>;
};
