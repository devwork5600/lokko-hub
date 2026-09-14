import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@lokko-hub/db';

export type SearchSuggestion = {
  label: string;
  query?: string;
  category?: string;
  categoryName?: string;
  subCategory?: string;
  subCategoryName?: string;
  product?: string;
  productName?: string;
  from: 'title' | 'product' | 'subCategory' | 'category';
};

// Kept in sync with NavSearchbar's MAX_SUGGESTIONS — structured matches
// (category/subCategory/product) always win over free-text listing titles;
// titles only fill in whatever's left once structured options run out.
const DISPLAY_LIMIT = 3;
const ROUTE_LIMIT = 10;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Ordered broadest-to-narrowest — category, then subcategory, then
  // product — so the list always reads generic-first, most-targeted-last.
  const [categories, subCategories, products] = await Promise.all([
    prisma.category.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, parentId: null },
      orderBy: { name: 'asc' },
      take: ROUTE_LIMIT,
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, parentId: { not: null } },
      include: { parent: true },
      orderBy: { name: 'asc' },
      take: ROUTE_LIMIT,
    }),
    prisma.product.findMany({
      where: { name: { contains: q, mode: 'insensitive' }, isActive: true },
      include: { category: { include: { parent: true } } },
      orderBy: { name: 'asc' },
      take: ROUTE_LIMIT,
    }),
  ]);

  const suggestions: SearchSuggestion[] = [];

  for (const category of categories) {
    suggestions.push({
      label: category.name,
      category: category.slug,
      categoryName: category.name,
      from: 'category',
    });
  }

  for (const sub of subCategories) {
    if (!sub.parent) continue;
    suggestions.push({
      label: sub.name,
      category: sub.parent.slug,
      categoryName: sub.parent.name,
      subCategory: sub.slug,
      subCategoryName: sub.name,
      from: 'subCategory',
    });
  }

  for (const product of products) {
    const subCategory = product.category;
    const topCategory = subCategory.parent ?? subCategory;
    suggestions.push({
      label: product.name,
      product: product.slug,
      productName: product.name,
      ...(subCategory.parentId ? { subCategory: subCategory.slug, subCategoryName: subCategory.name } : {}),
      category: topCategory.slug,
      categoryName: topCategory.name,
      from: 'product',
    });
  }

  // Free-text fallback: only once every structured option (category,
  // subcategory, product) is exhausted, never displaces one.
  if (suggestions.length < DISPLAY_LIMIT) {
    const listings = await prisma.listing.findMany({
      where: { title: { contains: q, mode: 'insensitive' }, status: 'ACTIVE', deletedAt: null },
      distinct: ['title'],
      take: DISPLAY_LIMIT - suggestions.length,
      orderBy: { createdAt: 'desc' },
      select: { title: true },
    });

    for (const listing of listings) {
      suggestions.push({ label: listing.title, query: listing.title, from: 'title' });
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, ROUTE_LIMIT) });
}
