import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Stack, StackProps, Tags, pipelines, Aspects } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { MainStage } from './MainStage';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps, Configurable {}

export class PipelineStack extends Stack {

  branchName: string;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    Aspects.of(this).add(new PermissionsBoundaryAspect());

    this.branchName = props.configuration.branchName;

    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    const pipeline = this.pipeline(props);

    const mainStage = new MainStage(this, 'org-trail-forwarding', {
      env: props.configuration.targetEnvironment,
      configuration: props.configuration,
    });
    pipeline.addStage(mainStage);

  }

  pipeline(props: PipelineStackProps): pipelines.CodePipeline {

    const source = pipelines.CodePipelineSource.connection('GemeenteNijmegen/aws-org-trail-forwarder', this.branchName, {
      connectionArn: props.configuration.codeStarConnectionArn,
    });

    const pipeline = new pipelines.CodePipeline(this, `org-trail-forwarding-${this.branchName}`, {
      pipelineName: `org-trail-forwarding-${this.branchName}-pipeline`,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        env: {
          BRANCH_NAME: this.branchName,
        },
        commands: [
          'yarn install --frozen-lockfile',
          'yarn build',
        ],
      }),
    });
    return pipeline;
  }
}