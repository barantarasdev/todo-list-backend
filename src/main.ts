import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.ALLOW_URLS,
    methods: 'GET,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })

  const config = new DocumentBuilder()
    .setTitle('Todo list')
    .setDescription('The API description')
    .setVersion('1.0.0')
    .addTag('TODO LIST')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('/docs', app, document)
  await app.listen(process.env.PORT || 5000)
}
bootstrap()
