import { AppBuilder } from "@broccoliapps/infra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AWS_ACCOUNT_ID = "155305329201";
const AWS_REGION = "us-west-2";
const DOMAIN = "broccoliapps.com";
const SSL_CERT_ARN = "arn:aws:acm:us-east-1:155305329201:certificate/9887f1e9-b8f8-4b9e-9135-3c35d35e7ae1"; // *.broccoliapps.com

new AppBuilder(AWS_ACCOUNT_ID, AWS_REGION, "broccoliapps-com", "prod")
  .withDomain(DOMAIN, ["", "www"], SSL_CERT_ARN)
  .withCloudFrontFn(path.join(__dirname, "cloudfront-fn.js"))
  .withApi(path.join(__dirname, "../dist/api"))
  .withSsr(path.join(__dirname, "../dist/ssr"))
  .withStatic(path.join(__dirname, "../dist/static"))
  .build();
