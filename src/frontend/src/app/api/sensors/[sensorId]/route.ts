import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic' // Add this line

export async function GET(request: Request, props: { params: Promise<{ sensorId: string }> }) {
  const params = await props.params;
  const sensorId = params.sensorId;
  try {
    const sensorId = (await props.params).sensorId
    const basePath = path.join(process.cwd(), '..', 'data', sensorId)
    const test = fs.readdirSync(basePath)
    // console.log(test)

    // Rest of your existing code...
    const sensorData = JSON.parse(
      fs.readFileSync(path.join(basePath, `${sensorId}.json`), 'utf-8'
    )
    )

    // Read configurations and messages for each data type
    const dataTypes = sensorData.sensorData
    const result = {
      sensor: sensorData,
      configurations: {} as Record<string, any>,
      messages: {} as Record<string, any>
    }

    for (const dataType of dataTypes) {
      try {
        result.configurations[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'configurations', `${dataType}-config.json`),
            'utf-8'
          )
        )
        result.messages[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'messages', `${dataType}-messages.json`),
            'utf-8'
          )
        )
      } catch (error) {
        console.error(`Error loading data for ${dataType}:`, error)
      }
    }

    // console.log(result)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: `Sensor ${sensorId} not found` },
      { status: 404 }
    )
  }
}

// PATCH handler for updating a sensor configuration
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sensorId: string } }
) {
  try {
    const { dataType, config } = await req.json();
    if (!dataType || !config) {
      return NextResponse.json(
        { error: 'Missing dataType or config' },
        { status: 400 }
      );
    }

    const sensorId = params.sensorId;
    const configDir = path.join(process.cwd(), '..', 'data', sensorId, 'configurations');
    const configFile = path.join(configDir, `${dataType}-config.json`);

    // Check if config file exists
    if (!fs.existsSync(configFile)) {
      return NextResponse.json(
        { error: 'Configuration file not found' },
        { status: 404 }
      );
    }

    // Write updated config
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    return NextResponse.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
