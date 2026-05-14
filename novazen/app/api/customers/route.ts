import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const format = searchParams.get('format');

  const customers = await prisma.customer.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ],
    } : {},
    include: { orders: { select: { total: true, status: true, createdAt: true, orderNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const headers = ['Nom', 'Email', 'Téléphone', 'Ville', 'Commandes', 'Total dépensé', 'Date inscription'];
    const rows = customers.map(c => [
      c.name,
      c.email,
      c.phone || '',
      c.city || '',
      c.orders.length,
      c.orders.reduce((sum, o) => sum + o.total, 0).toFixed(2),
      c.createdAt.toLocaleDateString('fr-FR'),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="clients-novazen.csv"',
      },
    });
  }

  return NextResponse.json(customers);
}
