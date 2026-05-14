import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueResult,
    pendingOrders,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
  });

  return NextResponse.json({
    totalOrders,
    totalCustomers,
    totalProducts,
    totalRevenue: revenueResult._sum.total || 0,
    monthlyRevenue: monthlyRevenue._sum.total || 0,
    pendingOrders,
    recentOrders,
    topProducts,
  });
}
