import { Bucket, BucketAccessControl, BucketProps } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface RemixStaticBucketProps extends BucketProps {}

export class RemixStaticBucket extends Bucket {
  constructor(scope: Construct, id: string, props?: RemixStaticBucketProps) {
    super(scope, id, {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,
      accessControl: BucketAccessControl.PUBLIC_READ,
      ...props,
    });
  }
}
