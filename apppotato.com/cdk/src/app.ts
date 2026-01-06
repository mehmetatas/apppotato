#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificateStack } from "./certificate-stack.js";
import { WebsiteStack } from "./website-stack.js";

const app = new cdk.App();

// Certificate must be in us-east-1 for CloudFront
const certStack = new CertificateStack(app, "apppotato-cert", {
  env: {
    account: "155305329201",
    region: "us-east-1",
  },
  crossRegionReferences: true,
});

// Website resources in us-west-2
new WebsiteStack(app, "apppotato-com", {
  env: {
    account: "155305329201",
    region: "us-west-2",
  },
  crossRegionReferences: true,
  certificate: certStack.certificate,
});

app.synth();
