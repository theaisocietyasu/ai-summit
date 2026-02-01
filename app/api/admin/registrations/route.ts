import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getDb } from "@/lib/server/mongo";

export const runtime = "nodejs";

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    200,
    Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)),
  );
  const skip = (page - 1) * limit;

  const search = url.searchParams.get("search")?.trim();
  const statusValues = parseCsv(url.searchParams.get("status"));
  const academicYears = parseCsv(url.searchParams.get("academicYear"));

  const sortByRaw = url.searchParams.get("sortBy") || "first_name";
  const sortOrderRaw = (url.searchParams.get("sortOrder") || "asc").toLowerCase();
  const sortOrder = sortOrderRaw === "desc" ? -1 : 1;

  const sortByAllowed = new Set(["first_name", "last_name", "email", "academic_year"]);
  const sortBy = sortByAllowed.has(sortByRaw) ? sortByRaw : "first_name";

  const and: any[] = [];

  if (search) {
    const regex = { $regex: search, $options: "i" };
    and.push({
      $or: [
        { email: regex },
        { first_name: regex },
        { last_name: regex },
        { middle_name: regex },
      ],
    });
  }

  if (academicYears.length > 0) {
    and.push({ academic_year: { $in: academicYears } });
  }

  if (statusValues.length > 0) {
    const statusConds: any[] = [];

    for (const s of statusValues) {
      if (s === "Approved") statusConds.push({ is_approved: true });
      else if (s === "Waitlisted") statusConds.push({ is_waitlisted: true });
      else if (s === "Rejected") statusConds.push({ is_rejected: true });
      else if (s === "Pending")
        statusConds.push({
          is_approved: false,
          is_waitlisted: false,
          is_rejected: false,
        });
    }

    if (statusConds.length > 0) {
      and.push({ $or: statusConds });
    }
  }

  const filter = and.length > 0 ? { $and: and } : {};

  const db = await getDb();
  const collection = db.collection("registrations");

  const totalCount = await collection.countDocuments(filter);
  const registrations = await collection
    .find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return NextResponse.json({
    registrations,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  });
}
