import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../services/database';
import { uploadToGridFS, deleteFileFromGridFS } from '../services/gridfs';
import { Registration } from '../models';
import { RegistrationSchema } from '../validation';
import { AppError } from '../middleware/errorHandler';

export async function createRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let uploadedFileId: ObjectId | null = null;

  try {
    const body = req.body;

    if (body.relevant_courses && typeof body.relevant_courses === 'string') {
      body.relevant_courses = body.relevant_courses
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }

    if (body.photo_release !== undefined) {
      body.photo_release = body.photo_release === 'true' || body.photo_release === true;
    }

    const validatedData = RegistrationSchema.parse(body);

    const file = req.file;
    const isStaff = validatedData.academic_year === 'Staff';
    const isEmployer = validatedData.academic_year === 'Employer';

    // Staff and Employers don't need a resume
    if (!isStaff && !isEmployer && !file) {
      const error: AppError = new Error('Resume is required');
      error.statusCode = 400;
      error.errors = { resume: 'Resume is required for student registrations' };
      throw error;
    }

    if (file) {
      if (file.mimetype !== 'application/pdf') {
        const error: AppError = new Error('Resume must be a PDF file');
        error.statusCode = 400;
        error.errors = { resume: 'Resume must be a PDF file' };
        throw error;
      }

      if (file.size > 5 * 1024 * 1024) {
        const error: AppError = new Error('Resume must be less than 5MB');
        error.statusCode = 400;
        error.errors = { resume: 'Resume must be less than 5MB' };
        throw error;
      }

      uploadedFileId = await uploadToGridFS(
        file.buffer,
        `resume_${Date.now()}_${file.originalname}`,
        file.mimetype
      );
    }

    const db = getDb();
    const now = Math.floor(Date.now() / 1000);

    const registration: Registration = {
      ...validatedData,
      resume: uploadedFileId ? uploadedFileId.toHexString() : undefined,
      is_waitlisted: false,
      is_approved: false,
      is_rejected: false,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection<Registration>('registrations').insertOne(registration);

    res.status(201).json({
      message: 'Registration submitted successfully',
      id: result.insertedId,
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteFileFromGridFS(uploadedFileId);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file after error:', deleteError);
      }
    }
    next(error);
  }
}

export async function getRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid registration ID' });
      return;
    }

    const db = getDb();
    const registration = await db
      .collection<Registration>('registrations')
      .findOne({ _id: new ObjectId(id) });

    if (!registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    res.json({ registration });
  } catch (error) {
    next(error);
  }
}
