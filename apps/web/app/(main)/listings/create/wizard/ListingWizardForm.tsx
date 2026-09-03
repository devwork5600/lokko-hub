'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { listingSchema, type ListingDraft } from '@lokko-hub/validations';

import type { Category } from '@/actions/category-actions';

import { Wizard } from './Wizard';

export function ListingWizardForm({ categories }: { categories: Category[] }) {
  const [step, setStep] = useState(0);

  const methods = useForm<ListingDraft>({
    resolver: zodResolver(listingSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      subCategoryId: '',
      productId: '',
      location: { city: '', postalCode: '', lat: 0, lng: 0 },
      price: { value: 0, unit: 'UNIT' },
      images: [],
    },
  });

  function next() {
    setStep((prev) => Math.min(prev + 1, 5));
  }

  function prev() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  return (
    <FormProvider {...methods}>
      <Wizard step={step} categories={categories} onNext={next} onPrev={prev} />
    </FormProvider>
  );
}
