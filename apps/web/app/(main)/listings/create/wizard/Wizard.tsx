import type { Category } from '@/actions/category-actions';

import { ProgressBar } from './ProgressBar';
import { StepCategory } from './steps/StepCategory';
import { StepDescription } from './steps/StepDescription';
import { StepImages } from './steps/StepImages';
import { StepLocation } from './steps/StepLocation';
import { StepPrice } from './steps/StepPrice';
import { StepTitle } from './steps/StepTitle';

const STEP_COUNT = 6;

export function Wizard({
  step,
  categories,
  onNext,
  onPrev,
}: {
  step: number;
  categories: Category[];
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <ProgressBar step={step} total={STEP_COUNT} />
      {step === 0 && <StepTitle onNext={onNext} />}
      {step === 1 && <StepCategory categories={categories} onNext={onNext} onPrev={onPrev} />}
      {step === 2 && <StepImages onNext={onNext} onPrev={onPrev} />}
      {step === 3 && <StepLocation onNext={onNext} onPrev={onPrev} />}
      {step === 4 && <StepPrice onNext={onNext} onPrev={onPrev} />}
      {step === 5 && <StepDescription onPrev={onPrev} />}
    </div>
  );
}
