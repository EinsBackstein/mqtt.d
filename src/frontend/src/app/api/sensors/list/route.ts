import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const basePath = path.join(process.cwd(), '..', 'data');
    const sensorFolders = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const sensors = [];
    for (const sensorId of sensorFolders) {
      try {
        const sensorJsonPath = path.join(basePath, sensorId, `${sensorId}.json`);
        if (fs.existsSync(sensorJsonPath)) {
          const sensorData = JSON.parse(fs.readFileSync(sensorJsonPath, 'utf-8'));
          sensors.push({
            sensorID: sensorData.sensorID,
            sensorName: sensorData.sensorName || sensorData.location || sensorId
          });
        }
      } catch (error) {
        // skip broken sensor
      }
    }
    return NextResponse.json(sensors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sensors' }, { status: 500 });
  }
}