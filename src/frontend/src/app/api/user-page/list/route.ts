import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), '..', 'user', 'user-pages');
    if (!fs.existsSync(dir)) return NextResponse.json([]);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const pages = files.map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      return JSON.parse(content);
    });
    return NextResponse.json(pages);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}