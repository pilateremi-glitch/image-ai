import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const bestSeller = searchParams.get('bestSeller');

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(featured === 'true' ? { isFeatured: true } : {}),
      ...(bestSeller === 'true' ? { isBestSeller: true } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const slug = slugify(data.name);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        images: typeof data.images === 'string' ? data.images : JSON.stringify(data.images),
        benefits: typeof data.benefits === 'string' ? data.benefits : JSON.stringify(data.benefits),
        variants: data.variants ? (typeof data.variants === 'string' ? data.variants : JSON.stringify(data.variants)) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
