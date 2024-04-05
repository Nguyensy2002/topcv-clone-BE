/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { FileDocument } from './schemas/files.schema';

@Injectable()
export class FilesService {
  //   constructor(
  //     @InjectModel(File.name)
  //     private fileModel: SoftDeleteModel<FileDocument>,
  //   ) {}
}
