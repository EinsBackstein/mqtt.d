import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const dir = path.join(process.cwd(), '..', 'user', 'user-pages');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${data.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}