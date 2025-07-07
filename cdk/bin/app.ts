import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack';
import { UIStack } from '../lib/ui-stack';
import { AuthStack } from '../lib/auth-stack';
import { DnsStack } from '../lib/dns-stack';

const domainName = 'personapp.com';
const subdomainApi = `api.${domainName}`;
const subdomainWeb = `app.${domainName}`;

const app = new cdk.App();

const dataStack = new DataStack(app, 'PersonDataStack');

const dnsStack = new DnsStack(app, 'DnsStack', { domainName });

const authStack = new AuthStack(app, 'PersonAuthStack');

const apiStack = new ApiStack(app, 'PersonApiStack', {
    personTable: dataStack.personTable,
    userPool: authStack.userPool,
    domainName: subdomainApi,
    certificate: dnsStack.certificate,
    hostedZone: dnsStack.hostedZone,
});

new UIStack(app, 'PersonUIStack', {
    apiUrl: apiStack.apiUrl,
    domainName: subdomainWeb,
    certificate: dnsStack.certificate,
    hostedZone: dnsStack.hostedZone,
});
