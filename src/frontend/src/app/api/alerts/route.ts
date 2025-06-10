import { NextResponse } from 'next/server';

let alerts: any[] = [];

export async function POST(request: Request) {
  const alert = await request.json();
  // Find index of existing alert with same sensorId, dataType, threshold
  const idx = alerts.findIndex(existing =>
    existing.sensorId === alert.sensorId &&
    existing.dataType === alert.dataType &&
    existing.threshold?.condition === alert.threshold?.condition &&
    existing.threshold?.value === alert.threshold?.value
  );

  if (idx !== -1) {
    // Replace the old alert with the new one
    alerts[idx] = alert;
    return new Response(JSON.stringify({ message: 'Alert updated' }), { status: 200 });
  } else {
    alerts.push(alert);
    return new Response(JSON.stringify({ message: 'Alert received' }), { status: 200 });
  }
}

export async function GET() {
  return new Response(JSON.stringify(alerts), { status: 200 });
}

export async function DELETE() {
  alerts = [];
  return new Response(JSON.stringify({ message: 'All alerts deleted' }), { status: 200 });
}