import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, customer: true },
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: data.status, notes: data.notes },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
