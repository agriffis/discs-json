import {S3} from '@aws-sdk/client-s3'

// Fetch to S3. This uses credentials from ~/.aws/credentials via AWS_PROFILE
// that should be set in .env.development.local
export const s3 = new S3({})

export const bucketParams = {
  discImages: {
    Bucket: 'scampersand-discdb-assets',
    Prefix: 'disc-images/',
  },
} as const
