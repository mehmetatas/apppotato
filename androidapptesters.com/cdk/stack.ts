import { AppBuilder } from "@broccoliapps/infra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AWS_ACCOUNT_ID = "155305329201";
const AWS_REGION = "us-west-2";
const DOMAIN = "androidapptesters.com";
// TODO: Create SSL certificate in us-east-1 and update this ARN
const SSL_CERT_ARN = "arn:aws:acm:us-east-1:155305329201:certificate/f8b96b34-13b1-4743-8de4-dde7c271dab6";

new AppBuilder(AWS_ACCOUNT_ID, AWS_REGION, "androidapptesters-com", "prod")
  .withDomain(DOMAIN, ["", "www"], SSL_CERT_ARN)
  .withCloudFrontFn(path.join(__dirname, "cloudfront-fn.js"))
  .withStatic(path.join(__dirname, "../dist"))
  .build();
