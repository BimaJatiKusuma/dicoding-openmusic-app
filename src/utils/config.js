import dotenv from 'dotenv';
dotenv.config();

const config = {
    app: {
        host: process.env.HOST,
        port: process.env.PORT
    },
    s3: {
        bucket: process.env.AWS_BUCKET_NAME,
    },
    rabbitMq: {
        server: process.env.RABBITMQ_SERVER,
    },
    redis: {
        host: process.env.REDIS_HOST,
    }
}

export default config;