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
  from: 'title' | 'product' | 'category';
};

const ROUTE_LIMIT = 10;
const TITLE_FALLBACK_THRESHOLD = 3;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions: SearchSuggestion[] = [];

  const products = await prisma.product.findMany({
    where: { name: { contains: q, mode: 'insensitive' }, isActive: true },
    include: { category: { include: { parent: true } } },
    take: ROUTE_LIMIT,
  });

  for (const product of products) {
    const subCategory = product.category;
    const topCategory = subCategory.parent ?? subCategory;
    suggestions.push({
      label: product.name,
      product: product.slug,
      productName: product.name,
      ...(subCategory.parentId
        ? { subCategory: subCategory.slug, subCategoryName: subCategory.name }
        : {}),
      category: topCategory.slug,
      categoryName: topCategory.name,
      from: 'product',
    });
  }

  if (suggestions.length < ROUTE_LIMIT) {
    const categories = await prisma.category.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      include: { parent: true },
      take: ROUTE_LIMIT - suggestions.length,
    });

    for (const category of categories) {
      if (category.parentId && category.parent) {
        suggestions.push({
          label: category.name,
          category: category.parent.slug,
          categoryName: category.parent.name,
          subCategory: category.slug,
          subCategoryName: category.name,
          from: 'category',
        });
      } else {
        suggestions.push({
          label: category.name,
          category: category.slug,
          categoryName: category.name,
          from: 'category',
        });
      }
    }
  }

  if (suggestions.length < TITLE_FALLBACK_THRESHOLD) {
    const listings = await prisma.listing.findMany({
      where: { title: { contains: q, mode: 'insensitive' }, status: 'ACTIVE', deletedAt: null },
      distinct: ['title'],
      take: TITLE_FALLBACK_THRESHOLD - suggestions.length,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        category: { select: { slug: true, name: true } },
        subCategory: { select: { slug: true, name: true } },
        product: { select: { slug: true, name: true } },
      },
    });

    for (const listing of listings) {
      suggestions.push({
        label: listing.title,
        query: listing.title,
        category: listing.category.slug,
        categoryName: listing.category.name,
        ...(listing.subCategory
          ? { subCategory: listing.subCategory.slug, subCategoryName: listing.subCategory.name }
          : {}),
        ...(listing.product ? { product: listing.product.slug, productName: listing.product.name } : {}),
        from: 'title',
      });
    }
  }

  return NextResponse.json({ suggestions: suggestions.slice(0, ROUTE_LIMIT) });
}
