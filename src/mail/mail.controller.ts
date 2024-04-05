/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Get, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/soft-delete-model';
import { Public, ResponseMessage } from 'src/decorate/customize';
import { Job, JobDocument } from 'src/jobs/schema/job.schema';
import { MailService } from 'src/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schema/Subscriber.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mails')
@Controller('mails')
export class MailController {
  constructor(
    private readonly mailsService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  //dùng thư viện cron để đặt lịch gửi mail về email
  //chạy vào 0:00 am
  @Cron('0 0 0 * * 0')
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skill;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      //todo
      //build template
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ',
            skills: item.skill,
          };
        });
        await this.mailerService.sendMail({
          to: 'nguyenquocsitvt@gmail.com',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job', // HTML body content
          context: {
            receiver: subs.name,
            jobs: jobs,
          },
        });
      }
    }
  }
}
