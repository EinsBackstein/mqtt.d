import { NextResponse } from 'next/server';

let alerts: any[] = [];

export async function POST(request: Request) {
  const alert = await request.json();
  // console.log('Received alert:', alert);
  // Check for duplicate: same sensorId, dataType, threshold, and value
  const isDuplicate = alerts.some(existing =>
    existing.sensorId === alert.sensorId &&
    existing.dataType === alert.dataType &&
    existing.threshold?.condition === alert.threshold?.condition &&
    existing.threshold?.value === alert.threshold?.value &&
    existing.value === alert.value
  );

  if (!isDuplicate) {
    alerts.push(alert);
    return new Response(JSON.stringify({ message: 'Alert received' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: 'Duplicate alert ignored' }), { status: 200 });
  }
}

export async function GET() {
  return new Response(JSON.stringify(alerts), { status: 200 });
}

export async function DELETE() {
  alerts = [];
  return new Response(JSON.stringify({ message: 'All alerts deleted' }), { status: 200 });
}