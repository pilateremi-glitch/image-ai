import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const promo = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        discount: data.discount,
        type: data.type || 'PERCENT',
        isActive: true,
        maxUsage: data.maxUsage || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
