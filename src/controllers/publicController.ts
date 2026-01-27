import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../services/database';
import { getFileFromGridFS } from '../services/gridfs';
import { Banner, Speaker, Event, Sponsor, SPONSOR_TIER_ORDER } from '../models';

export async function getHome(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    const banner = await db.collection<Banner>('banners').findOne({}, { sort: { _id: -1 } });
    res.json({ banner });
  } catch (error) {
    next(error);
  }
}

export async function getSpeakers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    const speakers = await db.collection<Speaker>('speakers').find({}).toArray();
    res.json({ speakers });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    const events = await db.collection<Event>('events').find({}).toArray();
    res.json({ events });
  } catch (error) {
    next(error);
  }
}

export async function getSponsors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    const sponsors = await db.collection<Sponsor>('sponsors').find({}).toArray();

    sponsors.sort((a, b) => SPONSOR_TIER_ORDER[a.sponsor_tier] - SPONSOR_TIER_ORDER[b.sponsor_tier]);

    res.json({ sponsors });
  } catch (error) {
    next(error);
  }
}

export async function getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fileId } = req.params;

    if (!ObjectId.isValid(fileId)) {
      res.status(400).json({ error: 'Invalid file ID' });
      return;
    }

    const file = await getFileFromGridFS(new ObjectId(fileId));

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    file.stream.pipe(res);
  } catch (error) {
    next(error);
  }
}
