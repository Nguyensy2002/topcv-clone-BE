/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from 'src/decorate/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files')
//sử dụng thư viện multer và thư viện file upload trong thư viện nestjs để thực hiện upload-file
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(
    @UploadedFile(
      //sử dụng thư viện file upload có sẵn trong nestjs để thực hiện validate file upload
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(jpg|jpeg|image\/jpeg|png|image\/png|gif|txt|application\/pdf|doc|docx|text\/plain)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024, //1MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return {
      fileName: file.filename,
    };
  }
}
