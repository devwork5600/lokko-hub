import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        'absolute inset-0 flex items-center justify-center rounded-none font-poppins text-2xl font-black text-primary-foreground uppercase dark:text-background',
        className,
      )}
    >
      Lokko Hub
    </Skeleton>
  );
}
