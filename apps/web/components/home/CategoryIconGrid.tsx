import Link from 'next/link';
import { IoFishOutline } from 'react-icons/io5';
import { PiCheese, PiFlowerTulipDuotone, PiPlant } from 'react-icons/pi';
import { TbApple, TbEggs } from 'react-icons/tb';

const items = [
  { title: 'Poisson', icon: IoFishOutline, href: '/listings?category=produits-animaux&subCategory=poisson' },
  { title: 'Plants & semis', icon: PiPlant, href: '/listings?category=jardin-plants&subCategory=plants-semis' },
  { title: 'Fromages', icon: PiCheese, href: '/listings?category=produits-artisanaux&subCategory=fromages' },
  {
    title: 'Pommes',
    icon: TbApple,
    href: '/listings?category=fruits-legumes&subCategory=fruits-frais&product=pomme',
  },
  { title: 'Fleurs', icon: PiFlowerTulipDuotone, href: '/listings?category=jardin-plants&subCategory=fleurs' },
  { title: 'Œufs', icon: TbEggs, href: '/listings?category=produits-animaux&subCategory=ufs' },
];

export function CategoryIconGrid() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-border transition-all hover:-translate-y-1 hover:text-primary hover:shadow-md"
          >
            <Icon className="h-8 w-8" />
            <span className="font-medium">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
