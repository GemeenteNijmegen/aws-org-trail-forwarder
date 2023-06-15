import { Stage, StageProps } from 'aws-cdk-lib';
import { Configurable } from './Configuration';
import { OrgTrailForwardingStack } from './OrgTrailForwardingStack';

export interface MainStageProps extends StageProps, Configurable {}

export class MainStage extends Stage {
  constructor(scope: any, id: string, props: MainStageProps) {
    super(scope, id);

    new OrgTrailForwardingStack(this, 'stack', {
      configuration: props.configuration,
    });

  }
}