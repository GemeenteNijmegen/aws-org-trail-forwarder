import {
  Stack,
  StackProps,
  aws_sqs as sqs,
  aws_iam as iam,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';

export interface OrgTrailForwardingStackProps extends StackProps, Configurable {}

export class OrgTrailForwardingStack extends Stack {
  constructor(scope: Construct, id: string, props: OrgTrailForwardingStackProps) {
    super(scope, id);

    // TODO check if we want to use encryption

    const queue = new sqs.Queue(this, 'queue', {
      enforceSSL: true,
      retentionPeriod: Duration.days(1), // Do not keep messages for longer than 1 day
    });

    queue.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowArnsToSendMessages',
      effect: iam.Effect.ALLOW,
      actions: ['sqs:SendMessage'],
      principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
      resources: [queue.queueArn],
      conditions: {
        'ForAllValues:ArnLike': {
          'aws:SourceArn': props.configuration.allowPublishFromArns,
        },
      },
    }));

  }
}