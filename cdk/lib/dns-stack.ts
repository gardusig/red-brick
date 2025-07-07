import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

interface DnsStackProps extends StackProps {
    domainName: string;
}

export class DnsStack extends Stack {
    public readonly hostedZone: route53.IHostedZone;
    public readonly certificate: certificatemanager.ICertificate;

    constructor(scope: Construct, id: string, props: DnsStackProps) {
        super(scope, id, props);

        this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: props.domainName,
        });

        this.certificate = new certificatemanager.DnsValidatedCertificate(this, 'SiteCert', {
            domainName: props.domainName,
            hostedZone: this.hostedZone,
            region: 'us-east-1',
        });
    }
}
