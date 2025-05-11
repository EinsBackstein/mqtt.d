import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { formSchema } from '@/lib/schema';
import yaml from 'js-yaml';

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const validatedData = formSchema.parse(data);
    const baseDir = path.join(process.cwd(), 'sensor-data', validatedData.sensorID);

    // Create main directory
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create subdirectories
    const configDir = path.join(baseDir, 'configurations');
    const messagesDir = path.join(baseDir, 'messages');
    [configDir, messagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    });

    // Save main sensor data without messages
    const mainData = {
      ...validatedData,
      configurations: undefined // Remove detailed configurations
    };
    
    // Save main files
    fs.writeFileSync(
      path.join(baseDir, `${validatedData.sensorID}.json`),
      JSON.stringify(mainData, null, 2)
    );
    fs.writeFileSync(
      path.join(baseDir, `${validatedData.sensorID}.yaml`),
      yaml.dump(mainData, { noRefs: true })
    );

    // Save configurations and initialize empty message files
    validatedData.configurations.forEach((config) => {
      const configFilename = `${config.dataType}-config.json`;
      
      // Save configuration
      fs.writeFileSync(
        path.join(configDir, configFilename),
        JSON.stringify(config, null, 2)
      );

      // Initialize empty messages file
      const messagesFilename = `${config.dataType}-messages.json`;
      fs.writeFileSync(
        path.join(messagesDir, messagesFilename),
        JSON.stringify([], null, 2)
      );
    });

    return NextResponse.json({
      message: 'Sensor created successfully',
      sensorId: validatedData.sensorID,
      configurations: validatedData.configurations.map(c => c.dataType),
      messageFiles: validatedData.configurations.map(c => `${c.dataType}-messages.json`)
    });

  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid sensor data' },
      { status: 400 }
    );
  }
}