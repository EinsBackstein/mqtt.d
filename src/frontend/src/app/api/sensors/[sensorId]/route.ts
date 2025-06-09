import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Add this line

export async function GET(request: Request, props: { params: Promise<{ sensorId: string }> }) {
  const params = await props.params;
  const sensorId = params.sensorId;
  try {
    const sensorId = (await props.params).sensorId;
    const basePath = path.join(process.cwd(), '..', 'data', sensorId);
    const test = fs.readdirSync(basePath);
    // console.log(test)

    // Rest of your existing code...
    const sensorData = JSON.parse(
      fs.readFileSync(path.join(basePath, `${sensorId}.json`), 'utf-8')
    );

    // Read configurations and messages for each data type
    const dataTypes = sensorData.sensorData;
    const result = {
      sensor: sensorData,
      configurations: {} as Record<string, any>,
      messages: {} as Record<string, any>
    };

    for (const dataType of dataTypes) {
      try {
        result.configurations[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'configurations', `${dataType}-config.json`),
            'utf-8'
          )
        );
        result.messages[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'messages', `${dataType}-messages.json`),
            'utf-8'
          )
        );
      } catch (error) {
        console.error(`Error loading data for ${dataType}:`, error);
      }
    }

    // console.log(result)
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
