import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        images: typeof data.images === 'string' ? data.images : JSON.stringify(data.images),
        benefits: typeof data.benefits === 'string' ? data.benefits : JSON.stringify(data.benefits),
        variants: data.variants ? (typeof data.variants === 'string' ? data.variants : JSON.stringify(data.variants)) : null,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
