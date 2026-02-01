import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../services/database";
import { uploadToGridFS, deleteFileFromGridFS } from "../services/gridfs";
import { Banner, Speaker, Event, Sponsor, Registration } from "../models";
import {
  BannerSchema,
  SpeakerSchema,
  EventSchema,
  SponsorSchema,
  RegistrationUpdateSchema,
} from "../validation";
import { AppError } from "../middleware/errorHandler";

async function handleFileUpload(
  file: Express.Multer.File | undefined,
  fieldName: string,
): Promise<string | null> {
  if (!file) return null;

  const fileId = await uploadToGridFS(
    file.buffer,
    `${fieldName}_${Date.now()}_${file.originalname}`,
    file.mimetype,
  );

  return `/api/files/${fileId.toHexString()}`;
}

export async function createBanner(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let uploadedFileId: string | null = null;

  try {
    const file = req.file;

    if (!file) {
      const error: AppError = new Error("Banner image is required");
      error.statusCode = 400;
      throw error;
    }

    uploadedFileId = await handleFileUpload(file, "banner");

    const bannerData = {
      banner_title: req.body.banner_title,
      banner_description: req.body.banner_description,
      banner_url: uploadedFileId!,
    };

    const validatedData = BannerSchema.parse(bannerData);

    const db = getDb();
    const result = await db
      .collection<Banner>("banners")
      .insertOne(validatedData);

    res.status(201).json({
      message: "Banner created successfully",
      id: result.insertedId,
      banner: { ...validatedData, _id: result.insertedId },
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        const fileId = uploadedFileId.split("/").pop();
        if (fileId) {
          await deleteFileFromGridFS(new ObjectId(fileId));
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded file after error:",
          deleteError,
        );
      }
    }
    next(error);
  }
}

export async function createSpeaker(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let uploadedFileId: string | null = null;

  try {
    const file = req.file;

    if (!file) {
      const error: AppError = new Error("Speaker headshot image is required");
      error.statusCode = 400;
      throw error;
    }

    uploadedFileId = await handleFileUpload(file, "headshot");

    const speakerData = {
      first_name: req.body.first_name,
      middle_name: req.body.middle_name || null,
      last_name: req.body.last_name || null,
      bio: req.body.bio,
      headshot_img_url: uploadedFileId!,
    };

    const validatedData = SpeakerSchema.parse(speakerData);

    const db = getDb();
    const result = await db
      .collection<Speaker>("speakers")
      .insertOne(validatedData);

    res.status(201).json({
      message: "Speaker created successfully",
      id: result.insertedId,
      speaker: { ...validatedData, _id: result.insertedId },
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        const fileId = uploadedFileId.split("/").pop();
        if (fileId) {
          await deleteFileFromGridFS(new ObjectId(fileId));
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded file after error:",
          deleteError,
        );
      }
    }
    next(error);
  }
}

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let uploadedFileId: string | null = null;

  try {
    const file = req.file;

    if (!file) {
      const error: AppError = new Error("Event thumbnail image is required");
      error.statusCode = 400;
      throw error;
    }

    uploadedFileId = await handleFileUpload(file, "thumbnail");

    let tags = req.body.tags;
    if (typeof tags === "string") {
      tags = tags
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }

    const eventData = {
      event_title: req.body.event_title,
      event_description: req.body.event_description,
      thumbnail_url: uploadedFileId!,
      tags: tags || [],
    };

    const validatedData = EventSchema.parse(eventData);

    const db = getDb();
    const result = await db
      .collection<Event>("events")
      .insertOne(validatedData);

    res.status(201).json({
      message: "Event created successfully",
      id: result.insertedId,
      event: { ...validatedData, _id: result.insertedId },
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        const fileId = uploadedFileId.split("/").pop();
        if (fileId) {
          await deleteFileFromGridFS(new ObjectId(fileId));
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded file after error:",
          deleteError,
        );
      }
    }
    next(error);
  }
}

export async function createSponsor(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let uploadedFileId: string | null = null;

  try {
    const file = req.file;

    if (!file) {
      const error: AppError = new Error("Sponsor logo image is required");
      error.statusCode = 400;
      throw error;
    }

    uploadedFileId = await handleFileUpload(file, "sponsor_logo");

    const sponsorData = {
      sponsor_name: req.body.sponsor_name,
      sponsor_tier: req.body.sponsor_tier,
      sponsor_logo: uploadedFileId!,
    };

    const validatedData = SponsorSchema.parse(sponsorData);

    const db = getDb();
    const result = await db
      .collection<Sponsor>("sponsors")
      .insertOne(validatedData);

    res.status(201).json({
      message: "Sponsor created successfully",
      id: result.insertedId,
      sponsor: { ...validatedData, _id: result.insertedId },
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        const fileId = uploadedFileId.split("/").pop();
        if (fileId) {
          await deleteFileFromGridFS(new ObjectId(fileId));
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded file after error:",
          deleteError,
        );
      }
    }
    next(error);
  }
}

export async function getRegistrations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const db = getDb();
    const { search, status, academicYear, sortBy, sortOrder } = req.query;

    // Build match stage for filtering
    const matchConditions: Record<string, unknown>[] = [];

    // Search filter (partial match on email, first_name, last_name, middle_name)
    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      matchConditions.push({
        $or: [
          { email: searchRegex },
          { first_name: searchRegex },
          { last_name: searchRegex },
          { middle_name: searchRegex },
        ],
      });
    }

    // Status filter
    if (status && typeof status === "string") {
      const statuses = status.split(",").map((s) => s.trim().toLowerCase());
      const statusConditions: Record<string, unknown>[] = [];

      if (statuses.includes("pending")) {
        statusConditions.push({
          is_approved: false,
          is_waitlisted: false,
          is_rejected: false,
        });
      }
      if (statuses.includes("approved")) {
        statusConditions.push({ is_approved: true });
      }
      if (statuses.includes("waitlisted")) {
        statusConditions.push({ is_waitlisted: true });
      }
      if (statuses.includes("rejected")) {
        statusConditions.push({ is_rejected: true });
      }

      if (statusConditions.length > 0) {
        matchConditions.push({ $or: statusConditions });
      }
    }

    // Academic year filter
    if (academicYear && typeof academicYear === "string") {
      const years = academicYear.split(",").map((y) => y.trim());
      matchConditions.push({ academic_year: { $in: years } });
    }

    // Build aggregation pipeline
    const pipeline: Record<string, unknown>[] = [];

    // Add match stage if there are conditions
    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // Add computed fields for sorting
    const statusOrder = { pending: 0, approved: 1, waitlisted: 2, rejected: 3 };
    const yearOrder: Record<string, number> = {
      Staff: 0,
      PhD: 1,
      "Master's": 2,
      Senior: 3,
      Junior: 4,
      Sophomore: 5,
      Freshman: 6,
    };

    pipeline.push({
      $addFields: {
        _statusSort: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$is_approved", true] },
                then: statusOrder.approved,
              },
              {
                case: { $eq: ["$is_waitlisted", true] },
                then: statusOrder.waitlisted,
              },
              {
                case: { $eq: ["$is_rejected", true] },
                then: statusOrder.rejected,
              },
            ],
            default: statusOrder.pending,
          },
        },
        _yearSort: {
          $switch: {
            branches: Object.entries(yearOrder).map(([year, order]) => ({
              case: { $eq: ["$academic_year", year] },
              then: order,
            })),
            default: 999,
          },
        },
        _middleNameSort: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$middle_name", null] },
                { $eq: ["$middle_name", ""] },
              ],
            },
            then: 1,
            else: 0,
          },
        },
      },
    });

    // Determine sort direction
    const order = sortOrder === "desc" ? -1 : 1;

    // Build sort stage
    let sortStage: Record<string, number> = { created_at: -1 };

    if (sortBy && typeof sortBy === "string") {
      switch (sortBy) {
        case "status":
          sortStage = { _statusSort: order, created_at: -1 };
          break;
        case "first_name":
          sortStage = { first_name: order, created_at: -1 };
          break;
        case "last_name":
          sortStage = { last_name: order, created_at: -1 };
          break;
        case "middle_name":
          sortStage = {
            _middleNameSort: order,
            middle_name: order,
            created_at: -1,
          };
          break;
        case "academic_year":
          sortStage = { _yearSort: order, created_at: -1 };
          break;
      }
    }

    pipeline.push({ $sort: sortStage });

    // Remove computed fields from output
    pipeline.push({
      $project: {
        _statusSort: 0,
        _yearSort: 0,
        _middleNameSort: 0,
      },
    });

    const registrations = await db
      .collection<Registration>("registrations")
      .aggregate(pipeline)
      .toArray();

    res.json({ registrations });
  } catch (error) {
    next(error);
  }
}

export async function updateRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid registration ID" });
      return;
    }

    const validatedData = RegistrationUpdateSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const db = getDb();
    const updateData = {
      ...validatedData,
      updated_at: Math.floor(Date.now() / 1000),
    };

    const result = await db
      .collection<Registration>("registrations")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }

    res.json({
      message: "Registration updated successfully",
      registration: result,
    });
  } catch (error) {
    next(error);
  }
}
