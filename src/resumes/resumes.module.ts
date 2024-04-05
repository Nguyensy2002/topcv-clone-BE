/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { Resume, ResumeSchema } from './schema/resume.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumesService } from './resumes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
