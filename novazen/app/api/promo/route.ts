import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 404 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 400 });
  }
  if (promo.maxUsage && promo.usageCount >= promo.maxUsage) {
    return NextResponse.json({ error: 'Code épuisé' }, { status: 400 });
  }

  return NextResponse.json({ discount: promo.discount, type: promo.type });
}
