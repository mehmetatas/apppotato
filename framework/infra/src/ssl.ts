import * as cdk from "aws-cdk-lib";
import { aws_certificatemanager as acm, aws_route53 as route53 } from "aws-cdk-lib";

export const createSslCert = (domain: string, awsAccount: string) => {
  const stackName = domain.replace(".", "-") + "-ssl-cert";

  const app = new cdk.App();

  const stack = new cdk.Stack(app, stackName, {
    env: {
      account: awsAccount,
      region: "us-east-1", // CloudFront requires certificates in us-east-1
    },
    crossRegionReferences: true,
  });

  // Look up hosted zone
  const hostedZone = route53.HostedZone.fromLookup(stack, "hosted-zone", {
    domainName: domain,
  });

  // Create wildcard certificate with DNS validation
  const certificate = new acm.Certificate(stack, "certificate", {
    domainName: domain,
    subjectAlternativeNames: [`*.${domain}`],
    validation: acm.CertificateValidation.fromDns(hostedZone),
    certificateName: `${domain}-wildcard`,
  });

  // Output the certificate ARN
  new cdk.CfnOutput(stack, "certificate-arn", {
    value: certificate.certificateArn,
    description: "SSL Certificate ARN - use this in stack.ts",
    exportName: stackName + "-arn",
  });

  app.synth();
};

// CLI runner
const [account, domain] = process.argv.slice(2);
if (!account || !domain) {
  console.log("Usage: npm run ssl -- <account> <domain>");
  console.log("Example: npm run ssl -- 123456789012 example.com");
} else {
  createSslCert(domain, account);
}
