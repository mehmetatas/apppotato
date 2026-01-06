import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WebsiteStackProps extends cdk.StackProps {
  certificate: acm.ICertificate;
}

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const { certificate } = props;

    const primaryDomain = "www.apppotato.com";
    const apexDomain = "apppotato.com";
    const altApexDomain = "appotato.com";
    const altWwwDomain = "www.appotato.com";

    // Lookup existing hosted zones
    const apppototoZone = route53.HostedZone.fromLookup(this, "apppotato-com-zone", {
      domainName: apexDomain,
    });

    const appototoZone = route53.HostedZone.fromLookup(this, "appotato-com-zone", {
      domainName: altApexDomain,
    });

    // S3 bucket for website content
    const websiteBucket = new s3.Bucket(this, "apppotato-com-website-bucket", {
      bucketName: `apppotato-website-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Function for redirects
    const redirectFunction = new cloudfront.Function(this, "apppotato-com-cf-function", {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;

  // Redirect non-primary domains to www.apppotato.com
  if (host === 'apppotato.com' || host === 'appotato.com' || host === 'www.appotato.com') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        'location': { value: 'https://www.apppotato.com' + request.uri }
      }
    };
  }

  return request;
}
      `),
      functionName: "apppotato-redirect",
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "apppotato-com-distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      domainNames: [primaryDomain, apexDomain, altApexDomain, altWwwDomain],
      certificate,
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Deploy website content
    new s3deploy.BucketDeployment(this, "apppotato-com-deploy-website", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../www"))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // Route 53 records for apppotato.com zone
    new route53.ARecord(this, "apppotato-com-www-a-record", {
      zone: apppototoZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, "apppotato-com-www-aaaa-record", {
      zone: apppototoZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.ARecord(this, "apppotato-com-apex-a-record", {
      zone: apppototoZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, "apppotato-com-apex-aaaa-record", {
      zone: apppototoZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // Route 53 records for appotato.com zone
    new route53.ARecord(this, "apppotato-com-alt-www-a-record", {
      zone: appototoZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, "apppotato-com-alt-www-aaaa-record", {
      zone: appototoZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.ARecord(this, "apppotato-com-alt-apex-a-record", {
      zone: appototoZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.AaaaRecord(this, "apppotato-com-alt-apex-aaaa-record", {
      zone: appototoZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // Outputs
    new cdk.CfnOutput(this, "apppotato-com-distribution-domain-name", {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, "apppotato-com-website-url", {
      value: `https://${primaryDomain}`,
    });
  }
}
