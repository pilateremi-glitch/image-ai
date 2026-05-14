import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.order.count({ where: status ? { status } : {} });

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const orderNumber = generateOrderNumber();

    let customer = await prisma.customer.findUnique({ where: { email: data.email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'France',
        paymentMethod: data.paymentMethod,
        promoCode: data.promoCode,
        discount: data.discount || 0,
        subtotal: data.subtotal,
        shipping: data.shipping || 0,
        total: data.total,
        notes: data.notes,
        customerId: customer.id,
        items: {
          create: data.items.map((item: { productId: string; name: string; price: number; quantity: number; variant?: string }) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
          })),
        },
      },
      include: { items: true },
    });

    if (data.promoCode) {
      await prisma.promoCode.updateMany({
        where: { code: data.promoCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
