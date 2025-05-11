import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { formSchema } from '@/lib/schema';
import yaml from 'js-yaml';

export async function POST(request: Request) {
  const data = await request.json();

  try {
    // Validierung mit Zod-Schema
    const validatedData = formSchema.parse(data);

    // Dateipfad erstellen
    const filenameJson = `${validatedData.sensorID}.json`;
    const filenameYaml = `${validatedData.sensorID}.yaml`;
    const directory = path.join(process.cwd(), 'sensor-data');
    const filePathJson = path.join(directory, filenameJson);
    const filePathYaml = path.join(directory, filenameYaml);

    // Verzeichnis erstellen falls nicht vorhanden
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Datei schreiben
    fs.writeFileSync(filePathJson, JSON.stringify(validatedData, null, 2));
    fs.writeFileSync(filePathYaml, yaml.dump(validatedData, { noRefs: true }));

    return NextResponse.json({
      message: 'Sensor erfolgreich gespeichert',
      filePath: [filenameJson, filenameYaml],
      data: validatedData,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e },
      { status: 400 }
    );
  }
}
