import { ObjectId } from 'mongodb';

export interface Banner {
  _id?: ObjectId;
  banner_title: string;
  banner_description: string;
  banner_url: string;
}
