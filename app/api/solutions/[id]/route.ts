import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { RowDataPacket } from "mysql2/promise"; // Import MySQL types

interface PageParams {
  params: { id: string };
}

// Define interface for Question
interface Question extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  tags: string | null;
  subject: string;
  uploadDateTime: string;
}

export async function GET(req: NextRequest, { params }: PageParams) {
  const { id } = params; // Removed unnecessary `await`

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<Question[] & RowDataPacket[]>(
      `
      SELECT questions.*, admins.name AS author
      FROM questions
      JOIN admins ON questions.authorId = admins.id 
      WHERE questions.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const question = rows[0];

    // Parse tags safely
    return NextResponse.json({
      ...question,
      tags: question.tags ? JSON.parse(question.tags) : [],
    });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
