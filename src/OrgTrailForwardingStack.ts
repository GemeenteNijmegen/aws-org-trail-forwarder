import {
  Stack,
  StackProps,
  aws_sqs as sqs,
  aws_iam as iam,
  aws_kms as kms,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';

export interface OrgTrailForwardingStackProps extends StackProps, Configurable { }

export class OrgTrailForwardingStack extends Stack {
  constructor(scope: Construct, id: string, props: OrgTrailForwardingStackProps) {
    super(scope, id, props);

    const key = this.setupKmsKeyForSqsQueue(props);
    const queue = this.setupQueue(props, key);
    this.setupUserForSqsQueue(queue, key);

  }

  setupQueue(props: OrgTrailForwardingStackProps, key: kms.Key) {
    const queue = new sqs.Queue(this, 'queue', {
      enforceSSL: true,
      retentionPeriod: Duration.days(1), // Do not keep messages for longer than 1 day
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: key,
    });

    queue.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowArnsToSendMessages',
      effect: iam.Effect.ALLOW,
      actions: ['sqs:SendMessage'],
      principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
      resources: [queue.queueArn],
      conditions: {
        ArnLike: {
          'aws:SourceArn': props.configuration.allowPublishFromArn,
        },
        StringEquals: {
          'aws:SourceAccount': props.configuration.logArchiveAccount,
        },
      },
    }));

    return queue;
  }

  setupUserForSqsQueue(queue: sqs.Queue, key: kms.Key) {
    const user = new iam.User(this, 'org-trail-queue-user', {
      userName: 'org-trail-queue-user',
    });

    user.addToPolicy(new iam.PolicyStatement({
      sid: 'AllowSqsToReceiveMessages',
      effect: iam.Effect.ALLOW,
      actions: ['sqs:ReceiveMessage'],
      resources: [queue.queueArn],
    }));

    user.addToPolicy(new iam.PolicyStatement({
      sid: 'AllowToUseQueueKmsKey',
      effect: iam.Effect.ALLOW,
      actions: [
        'kms:GenerateDataKey*',
        'kms:Decrypt',
      ],
      resources: [key.keyArn],
    }));

    return user;

  }


  setupKmsKeyForSqsQueue(props: OrgTrailForwardingStackProps) {
    const key = new kms.Key(this, 'queue-key', {
      alias: 'org-trail-queue-key',
      description: 'KMS key for OrgTrail SQS queue (SIEM/SOC)',
    });

    key.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowS3ToSendMessagesUsingKey',
      effect: iam.Effect.ALLOW,
      actions: [
        'kms:GenerateDataKey*',
        'kms:Encrypt',
      ],
      principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
      resources: ['*'],
      conditions: {
        ArnLike: {
          'aws:SourceArn': props.configuration.allowPublishFromArn,
        },
        StringEquals: {
          'aws:SourceAccount': props.configuration.logArchiveAccount,
        },
      },
    }));

    return key;
  }

}