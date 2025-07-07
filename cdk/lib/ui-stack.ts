import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

interface UIStackProps extends StackProps {
    apiUrl?: string;
    domainName: string;
    certificate: certificatemanager.ICertificate;
    hostedZone: route53.IHostedZone;
}

export class UIStack extends Stack {
    constructor(scope: Construct, id: string, props: UIStackProps) {
        super(scope, id, props);

        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            websiteIndexDocument: 'index.html',
            publicReadAccess: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket),
            },
            domainNames: [props.domainName],
            certificate: props.certificate,
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(5),
                },
            ],

        });

        new route53.ARecord(this, 'WebAliasRecord', {
            zone: props.hostedZone,
            recordName: props.domainName,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
        });

        new CfnOutput(this, 'AppDomain', {
            value: `https://${props.domainName}`,
        });
    }
}
