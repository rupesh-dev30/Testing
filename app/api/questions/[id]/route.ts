import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import { RowDataPacket } from "mysql2/promise";

interface Question extends RowDataPacket {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  subject: string;
  uploadDateTime: string;
  authorId: number;
  solution?: string | null;
  solutionDate?: string | null;
  createdAt: string;
  author: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  // Validate the id if needed
  if (!id) {
    return NextResponse.json({ error: "Missing question ID" }, { status: 400 });
  }

  // Example query, adjust as needed
  try {
    const [rows] = await pool.query<Question[] & RowDataPacket[]>(
      `
      SELECT questions.*, admins.name AS author 
      FROM questions 
      JOIN admins ON questions.authorId = admins.id 
      WHERE questions.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const question = rows[0];
    question.tags = question.tags ? JSON.parse(question.tags) : [];

    return NextResponse.json(question);
  } catch (error) {
    console.error("Question API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
