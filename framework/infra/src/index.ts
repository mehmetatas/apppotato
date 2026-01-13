// @broccoliapps/infra
// Reusable CDK constructs for deploying backend/SaaS infrastructure on AWS

import * as cdk from "aws-cdk-lib";
import {
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_logs as logs,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_route53_targets as route53targets,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
} from "aws-cdk-lib";
import fs from "fs";

export type Env = "prod" | string;

export type LambdaConfig = Pick<
  lambda.FunctionProps,
  "memorySize" | "timeout" | "environment" | "reservedConcurrentExecutions"
>;

export const defaultConfig = {
  lambda: {
    memorySize: 256,
    timeout: cdk.Duration.seconds(10),
    environment: {},
    reservedConcurrentExecutions: 10,
  } as LambdaConfig,
  table: {
    gsiCount: 5,
  },
};

type LambdaDef = {
  path: string;
  config?: LambdaConfig;
};

export class AppBuilder {
  private stack!: cdk.Stack;

  private domain?: string;
  private subdomains?: string[];
  private sslCertArn?: string;
  private ssrLambdaDef?: LambdaDef;
  private apiLambdaDef?: LambdaDef;
  private cloudfrontFnPath?: string;
  private staticPath?: string;

  constructor(
    private readonly account: string,
    private readonly region: string,
    private readonly appName: string,
    private readonly env: Env
  ) {}

  private isProd() {
    return this.env === "prod";
  }

  private resourceName(suffix = ""): string {
    const env = this.isProd() ? "" : `-${this.env}`;
    suffix = suffix ? `-${suffix}` : "";
    return `${this.appName}${env}${suffix}`; // <app> | <app>-<env> | <app>-<env>-<suffix> | <app>-<suffix>
  }

  private configureDdb() {
    const table = new dynamodb.Table(this.stack, this.resourceName("table"), {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: this.resourceName(),
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: this.isProd()
        ? {
            pointInTimeRecoveryEnabled: true,
            recoveryPeriodInDays: 7,
          }
        : undefined,
    });

    for (let i = 1; i <= defaultConfig.table.gsiCount; i++) {
      const indexName = `gsi${i}`;
      table.addGlobalSecondaryIndex({
        indexName,
        partitionKey: { name: `${indexName}_pk`, type: dynamodb.AttributeType.STRING },
        sortKey: { name: `${indexName}_sk`, type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL, // shared GSIs almost always use/need ALL projection
      });
    }

    return table;
  }

  public withDomain(domain: string, subdomains: string[], sslCertArn: string) {
    if (subdomains.length === 0) {
      throw new Error("At least 1 subdomain must be specified");
    }
    this.domain = domain;
    this.subdomains = subdomains;
    this.sslCertArn = sslCertArn;
    return this;
  }

  public withApi(path: string, config?: LambdaConfig) {
    this.apiLambdaDef = { path, config };
    return this;
  }

  public withSsr(path: string, config?: LambdaConfig) {
    this.ssrLambdaDef = { path, config };
    return this;
  }

  public withCloudFrontFn(path: string) {
    this.cloudfrontFnPath = path;
    return this;
  }

  public withStatic(path: string) {
    this.staticPath = path;
    return this;
  }

  private configureStaticBucket(isDefaultOrigin = false): s3.Bucket {
    const bucket = new s3.Bucket(this.stack, this.resourceName("static-bucket"), {
      bucketName: this.resourceName("static"),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: this.isProd() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !this.isProd(),
    });

    // Deploy static files to S3
    // If this is the default origin (static-only site), deploy to root
    // Otherwise, deploy under /static/ prefix
    new s3deploy.BucketDeployment(this.stack, this.resourceName("static-deploy"), {
      sources: [s3deploy.Source.asset(this.staticPath!)],
      destinationBucket: bucket,
      destinationKeyPrefix: isDefaultOrigin ? undefined : "static",
      cacheControl: [s3deploy.CacheControl.maxAge(cdk.Duration.days(365))],
    });

    return bucket;
  }

  private configureLambda(
    name: string,
    { path, config }: LambdaDef,
    { table }: { table?: dynamodb.Table }
  ): lambda.Function {
    const lambdaFn = new lambda.Function(this.stack, this.resourceName(name), {
      functionName: this.resourceName(name),
      code: lambda.Code.fromAsset(path),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      // Logging
      logGroup: new logs.LogGroup(this.stack, this.resourceName(`${name}-log-group`), {
        logGroupName: this.resourceName(`${name}-logs`),
        retention: this.isProd() ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
        removalPolicy: this.isProd() ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      }),
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: this.isProd() ? lambda.ApplicationLogLevel.INFO : lambda.ApplicationLogLevel.DEBUG,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      // Config with defaults
      memorySize: config?.memorySize ?? defaultConfig.lambda.memorySize,
      timeout: config?.timeout ?? defaultConfig.lambda.timeout,
      environment: config?.environment ?? defaultConfig.lambda.environment,
      reservedConcurrentExecutions:
        config?.reservedConcurrentExecutions ?? defaultConfig.lambda.reservedConcurrentExecutions,
    });

    // All lambdas can read/write table (if table exists)
    if (table) {
      table.grantReadWriteData(lambdaFn);
    }

    // All lambdas can read ssm params
    lambdaFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/${this.resourceName()}/*`], // /parameter/{appname}/* or /parameter/{appname}-{env}/*
      })
    );

    return lambdaFn;
  }

  private configureCloudFront({
    ssrLambda,
    apiLambda,
    staticBucket,
  }: {
    ssrLambda?: lambda.Function;
    apiLambda?: lambda.Function;
    staticBucket?: s3.Bucket;
  }) {
    if (!ssrLambda && !staticBucket && !apiLambda) {
      // no need to create cloudfront
      return;
    }

    const { domain, subdomains } = this;
    if (!domain || !subdomains) {
      throw new Error("domain and subdomains must be specified for creating cloudfront distribution");
    }

    // Viewer request function
    let functionAssociations: cloudfront.FunctionAssociation[] | undefined;
    if (this.cloudfrontFnPath) {
      functionAssociations = [
        {
          function: new cloudfront.Function(this.stack, this.resourceName("cf-function"), {
            functionName: this.resourceName("cf-function"),
            runtime: cloudfront.FunctionRuntime.JS_2_0,
            code: cloudfront.FunctionCode.fromInline(fs.readFileSync(this.cloudfrontFnPath!, "utf8")),
          }),
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ];
    }

    // OAC for Lambda origins
    let cfnOacLambda: cloudfront.FunctionUrlOriginAccessControl | undefined;
    if (ssrLambda || apiLambda) {
      cfnOacLambda = new cloudfront.FunctionUrlOriginAccessControl(this.stack, this.resourceName("oac"), {
        originAccessControlName: this.resourceName("oac"),
        signing: new cloudfront.Signing(cloudfront.SigningProtocol.SIGV4, cloudfront.SigningBehavior.ALWAYS),
      });
    }

    // Build behavior configs
    type BehaviorConfig = { path: string; origin: cloudfront.IOrigin; options: cloudfront.AddBehaviorOptions };
    const behaviors: BehaviorConfig[] = [];

    if (ssrLambda) {
      const ssrFunctionUrl = ssrLambda.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.AWS_IAM });
      // SSR pages can be cached
      const ssrCachePolicy = new cloudfront.CachePolicy(this.stack, this.resourceName("www-cache-policy"), {
        cachePolicyName: this.resourceName("www-cache-policy"),
        comment: "Cache policy for SSR endpoints",
        defaultTtl: cdk.Duration.seconds(0),
        minTtl: cdk.Duration.seconds(0),
        maxTtl: cdk.Duration.days(365),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      });
      behaviors.push({
        path: "/*",
        origin: new origins.FunctionUrlOrigin(ssrFunctionUrl, {
          originAccessControlId: cfnOacLambda!.originAccessControlId,
          originId: this.resourceName("ssr-origin"),
        }),
        options: {
          compress: true,
          cachePolicy: ssrCachePolicy,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          functionAssociations,
        },
      });
    }

    if (apiLambda) {
      const apiFunctionUrl = apiLambda.addFunctionUrl({ authType: lambda.FunctionUrlAuthType.AWS_IAM });
      behaviors.push({
        path: "/api/*",
        origin: new origins.FunctionUrlOrigin(apiFunctionUrl, {
          originAccessControlId: cfnOacLambda!.originAccessControlId,
          originId: this.resourceName("api-origin"),
        }),
        options: {
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          functionAssociations,
        },
      });
    }

    if (staticBucket) {
      behaviors.push({
        path: "/static/*",
        origin: origins.S3BucketOrigin.withOriginAccessControl(staticBucket, {
          originId: this.resourceName("static-origin"),
        }),
        options: {
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations,
        },
      });
    }

    // Pop first as default, rest as additional
    const [defaultBehavior, ...additionalBehaviors] = behaviors;

    if (!defaultBehavior) {
      throw new Error("No behaviour found!"); // this should never happen, just added to make compiler happy
    }

    const distribution = new cloudfront.Distribution(this.stack, this.resourceName("distribution"), {
      defaultBehavior: {
        origin: defaultBehavior.origin,
        ...defaultBehavior.options,
      },
      additionalBehaviors: Object.fromEntries(
        additionalBehaviors.map((b) => [b.path, { origin: b.origin, ...b.options }])
      ),
      comment: this.resourceName("distribution"),
      enabled: true,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      certificate: this.getSslCert(),
      domainNames: subdomains.map((sd) => (sd === "" ? domain : `${sd}.${domain}`)),
      defaultRootObject: "",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Grant Lambda invokes
    if (ssrLambda) {
      this.grantLambdaInvoke(distribution, "ssr", ssrLambda);
    }
    if (apiLambda) {
      this.grantLambdaInvoke(distribution, "api", apiLambda);
    }

    return distribution;
  }

  private grantLambdaInvoke(distribution: cloudfront.Distribution, name: "api" | "ssr", lambdaFn: lambda.Function) {
    new lambda.CfnPermission(this.stack, this.resourceName(`cf-${name}-invoke-url-perm`), {
      action: "lambda:InvokeFunctionUrl",
      functionName: lambdaFn.functionName,
      principal: "cloudfront.amazonaws.com",
      sourceArn: `arn:aws:cloudfront::${this.stack.account}:distribution/${distribution.distributionId}`,
    });
    new lambda.CfnPermission(this.stack, this.resourceName(`cf-${name}-invoke-perm`), {
      action: "lambda:InvokeFunction",
      functionName: lambdaFn.functionName,
      principal: "cloudfront.amazonaws.com",
      sourceArn: `arn:aws:cloudfront::${this.stack.account}:distribution/${distribution.distributionId}`,
    });
  }

  private hostedZone!: route53.IHostedZone;
  private getHostedZone(): route53.IHostedZone {
    if (!this.domain) {
      throw new Error("Cannot create hosted without a domain");
    }
    if (!this.hostedZone) {
      this.hostedZone = route53.HostedZone.fromLookup(this.stack, this.resourceName("hosted-zone"), {
        domainName: this.domain,
      });
    }
    return this.hostedZone;
  }

  private sslCert!: acm.ICertificate;
  private getSslCert(): acm.ICertificate {
    if (!this.sslCertArn) {
      throw new Error("SSL certificate ARN is not set!");
    }
    if (!this.sslCert) {
      this.sslCert = acm.Certificate.fromCertificateArn(this.stack, this.resourceName("ssl-cert"), this.sslCertArn);
    }
    return this.sslCert;
  }

  private configureRoute53(distribution: cloudfront.IDistribution) {
    if (!this.domain || !this.subdomains) {
      throw new Error("Cannot configure route53 without domain and subdomains");
    }
    for (const subdomain of this.subdomains) {
      new route53.ARecord(this.stack, this.resourceName(`alias-record-${subdomain || "-root"}`), {
        zone: this.getHostedZone(),
        recordName: subdomain,
        target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
      });
    }
  }

  public build() {
    if (!this.domain) {
      throw new Error("domain not set");
    }
    if (!this.ssrLambdaDef && !this.staticPath) {
      throw new Error("At least one of SSR Lambda or static path must be set");
    }

    const app = new cdk.App();
    this.stack = new cdk.Stack(app, this.resourceName(), {
      env: {
        account: this.account,
        region: this.region,
      },
    });

    // Only create table if we have lambdas that need it
    let table: dynamodb.Table | undefined;
    if (this.ssrLambdaDef || this.apiLambdaDef) {
      table = this.configureDdb();
    }

    // Configure SSR lambda if provided
    let ssrLambda: lambda.Function | undefined;
    if (this.ssrLambdaDef) {
      ssrLambda = this.configureLambda("ssr", this.ssrLambdaDef, { table });
    }

    // Configure API lambda if provided
    let apiLambda: lambda.Function | undefined;
    if (this.apiLambdaDef) {
      apiLambda = this.configureLambda("api", this.apiLambdaDef, { table });
    }

    // Configure static bucket
    // isDefaultOrigin=true when no SSR lambda (static-only site)
    let staticBucket: s3.Bucket | undefined;
    if (this.staticPath) {
      const isDefaultOrigin = !this.ssrLambdaDef;
      staticBucket = this.configureStaticBucket(isDefaultOrigin);
    }

    const distribution = this.configureCloudFront({ ssrLambda, apiLambda, staticBucket });

    if (distribution) {
      this.configureRoute53(distribution);
    }

    app.synth();
  }
}
