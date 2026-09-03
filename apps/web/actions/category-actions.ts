'use server';

import { prisma } from '@lokko-hub/db';

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          products: {
            where: { isActive: true },
            select: { id: true, name: true, slug: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    subcategories: category.children,
  }));
}

export type Category = Awaited<ReturnType<typeof getCategories>>[number];
