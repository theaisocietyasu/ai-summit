import { ObjectId } from 'mongodb';

export interface Speaker {
  _id?: ObjectId;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  bio: string;
  headshot_img_url: string;
}
