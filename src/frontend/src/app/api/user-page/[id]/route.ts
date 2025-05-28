import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const filePath = path.join(process.cwd(), '..', 'user', 'user-pages', `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const filePath = path.join(process.cwd(), '..', 'user', 'user-pages', `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}