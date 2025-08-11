import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, Res } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';

@Controller('uploads')
export class UploadsController {
  @Post('course-thumbnail')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'uploads', 'courses'),
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadCourseThumbnail(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/courses/${file.filename}`;
    return res.status(201).json({ url: fileUrl });
  }

  @Post('lesson-media')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: join(process.cwd(), 'public', 'uploads', 'lessons'),
          filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  uploadLessonMedia(@UploadedFiles() files: { video?: Express.Multer.File[], thumbnail?: Express.Multer.File[] }, @Res() res: Response) {
    const response: { videoUrl?: string; thumbnailUrl?: string } = {};
    
    if (files.video && files.video[0]) {
      response.videoUrl = `/uploads/lessons/${files.video[0].filename}`;
    }
    
    if (files.thumbnail && files.thumbnail[0]) {
      response.thumbnailUrl = `/uploads/lessons/${files.thumbnail[0].filename}`;
    }
    
    return res.status(201).json(response);
  }
}
