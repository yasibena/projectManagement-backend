import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  deadline: Date;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 'on_track' })
  risk: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
