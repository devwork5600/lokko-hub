'use client';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import { Skeleton } from '@/components/ui/skeleton';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ImageItem = { url: string; index: number };

function reindex(list: ImageItem[]): ImageItem[] {
  return list.map((img, index) => ({ url: img.url, index }));
}

function SortableImage({ image, onRemove }: { image: ImageItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.url,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group relative aspect-square overflow-hidden rounded-lg border border-border"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />
      <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Retirer l'image"
        className="absolute top-1.5 right-1.5 z-20 cursor-pointer rounded-full bg-foreground/70 p-1.5 text-background transition-colors hover:bg-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ImageUploadField({ onUploadingChange }: { onUploadingChange?: (uploading: boolean) => void }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ListingDraft>();

  const images = watch('images');
  const [uploading, setUploading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function setUploadingState(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function uploadFiles(files: File[]) {
    setError(null);
    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) setError(`Maximum ${MAX_IMAGES} images.`);

    setUploadingState(true);
    setPendingCount(toUpload.length);
    try {
      for (const file of toUpload) {
        if (file.size > MAX_FILE_SIZE) {
          setError('Chaque image doit faire moins de 5 Mo.');
          setPendingCount((prev) => prev - 1);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Échec de l'upload.");
          setPendingCount((prev) => prev - 1);
          continue;
        }

        setValue('images', reindex([...watch('images'), { url: result.url, index: 0 }]), { shouldDirty: true });
        setPendingCount((prev) => prev - 1);
      }
    } finally {
      setUploadingState(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    disabled: uploading || images.length >= MAX_IMAGES,
    onDrop: uploadFiles,
  });

  function handleRemove(index: number) {
    setValue(
      'images',
      reindex(images.filter((img) => img.index !== index)),
      { shouldDirty: true },
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    setValue('images', reindex(arrayMove(images, oldIndex, newIndex)), { shouldDirty: true });
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex h-40 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm transition-colors ${
          images.length >= MAX_IMAGES
            ? 'cursor-not-allowed opacity-50'
            : isDragActive
              ? 'border-primary bg-muted'
              : 'border-border hover:bg-muted'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {isDragActive ? 'Dépose les images ici...' : `Glisse-dépose ou clique (${images.length}/${MAX_IMAGES})`}
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}

      {(images.length > 0 || pendingCount > 0) && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.url)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3">
              {images.map((image) => (
                <SortableImage key={image.url} image={image} onRemove={() => handleRemove(image.index)} />
              ))}
              {Array.from({ length: pendingCount }).map((_, i) => (
                <Skeleton key={`pending-${i}`} className="aspect-square rounded-lg" />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
