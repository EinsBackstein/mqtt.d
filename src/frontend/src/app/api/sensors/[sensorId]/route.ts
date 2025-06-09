import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET /api/sensors/[sensorId]?dataType=...
export async function GET(request: NextRequest, { params }: { params: { sensorId: string } }) {
  const sensorId = params.sensorId;
  const url = new URL(request.url);
  const dataType = url.searchParams.get('dataType');

  try {
    const basePath = path.join(process.cwd(), '..', 'data', sensorId);
    const sensorFile = path.join(basePath, `${sensorId}.json`);
    if (!fs.existsSync(sensorFile)) {
      return NextResponse.json({ error: `Sensor ${sensorId} not found` }, { status: 404 });
    }
    const sensorData = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'));

    // If dataType is provided, return only messages for that dataType
    if (dataType) {
      const messagesFile = path.join(basePath, 'messages', `${dataType}-messages.json`);
      let messages: any[] = [];
      if (fs.existsSync(messagesFile)) {
        messages = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
      }
      return NextResponse.json({
        sensor: sensorData,
        messages: { [dataType]: messages }
      });
    }

    // Otherwise, return all data as before
    const dataTypes = sensorData.sensorData;
    const result = {
      sensor: sensorData,
      configurations: {} as Record<string, any>,
      messages: {} as Record<string, any>
    };

    for (const dt of dataTypes) {
      try {
        result.configurations[dt] = JSON.parse(
          fs.readFileSync(path.join(basePath, 'configurations', `${dt}-config.json`), 'utf-8')
        );
        result.messages[dt] = JSON.parse(
          fs.readFileSync(path.join(basePath, 'messages', `${dt}-messages.json`), 'utf-8')
        );
      } catch (error) {
        // skip missing/broken files
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Sensor ${sensorId} not found` },
      { status: 404 }
    );
  }
}

// PATCH handler for updating a sensor configuration
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sensorId: string } }
) {
  try {
    const { sensor } = await req.json();
    if (!sensor) {
      return NextResponse.json(
        { error: 'Missing sensor object' },
        { status: 400 }
      );
    }

    const sensorId = params.sensorId;
    const basePath = path.join(process.cwd(), '..', 'data', sensorId);
    const sensorFile = path.join(basePath, `${sensorId}.json`);
    const configDir = path.join(basePath, 'configurations');
    const messagesDir = path.join(basePath, 'messages');

    // Update only the basic sensor fields
    if (fs.existsSync(sensorFile)) {
      const existing = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'));
      const updated = { ...existing, ...sensor };
      fs.writeFileSync(sensorFile, JSON.stringify(updated, null, 2));

      // --- Create config/messages files for new sensorData types ---
      const prevTypes = Array.isArray(existing.sensorData) ? existing.sensorData.map(String) : [];
      const newTypes = Array.isArray(sensor.sensorData) ? sensor.sensorData.map(String) : [];
      const addedTypes = newTypes.filter((type: any) => !prevTypes.includes(type));

      // Helper: default config and messages
      const defaultConfig = (dataType: string) => ({
        dataType,
        name: dataType,
        description: "",
        unit: "",
        maxAgeHours: 24,
        grenzwerte: [],
      });
      const defaultMessages: never[] = [];

      // Ensure directories exist
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
      if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir, { recursive: true });

      for (const type of addedTypes) {
        // Config file
        const configFile = path.join(configDir, `${type}-config.json`);
        if (!fs.existsSync(configFile)) {
          fs.writeFileSync(configFile, JSON.stringify(defaultConfig(type), null, 2));
        }
        // Messages file
        const messagesFile = path.join(messagesDir, `${type}-messages.json`);
        if (!fs.existsSync(messagesFile)) {
          fs.writeFileSync(messagesFile, JSON.stringify(defaultMessages, null, 2));
        }
      }
      // ---

      return NextResponse.json({ message: 'Sensor updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Sensor not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
