import { ObjectId } from 'mongodb';

export interface Event {
  _id?: ObjectId;
  event_title: string;
  event_description: string;
  thumbnail_url: string;
  tags: string[];
}
