import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    s3 = new XAWS.S3({ signatureVersion: 'v4' });
    bucketName = process.env.ATTACHMENT_S3_BUCKET;

    getAttachmentUrl(id: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${id}`;
    }

    getUploadUrl(id: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: id,
            Expires: process.env.SIGNED_URL_EPIRATION,
        }) as string;
    }
}
