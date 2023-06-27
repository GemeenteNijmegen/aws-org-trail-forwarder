import { Statics } from './Statics';

/**
 * Custom Environment with obligatory accountId and region
 */
export interface Environment {
  account: string;
  region: string;
}

export interface Configurable {
  configuration : Configuration;
}

export interface Configuration {
  /**
   * The git branch name to which this configuration applies.
   */
  branchName: string;

  /**
   * Code star connection arn in the deployment environment
   */
  codeStarConnectionArn: string;

  /**
   * Deployment environment
   */
  deploymentEnvironment: Environment;

  /**
   * Target environment
   */
  targetEnvironment: Environment;

  /**
   * A list of arns that are allowed to publish to the queue
   * that is setup in this project. Wildcards are allowed
   * @see https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html#Conditions_ARN
   */
  allowPublishFromArn: string;

  /**
   * The account ID that contains the orgtrail bucket
   */
  logArchiveAccount: string;

}

export const configurations: { [key: string]: Configuration } = {
  main: {
    branchName: 'main',
    codeStarConnectionArn: Statics.gnBuildCodeStarConnectionArn,
    deploymentEnvironment: Statics.deploymentEnvironment,
    targetEnvironment: Statics.irvnEnvironment,
    allowPublishFromArn: 'arn:aws:s3:::aws-controltower-logs-530584348862-eu-central-1',
    logArchiveAccount: '530584348862',
  },
};

export function getConfiguration(buildBranch: string) {
  const config = configurations[buildBranch];
  if (!config) {
    throw Error(`No configuration for branch ${buildBranch} found. Add a configuration in Configuration.ts`);
  }
  return config;
}
