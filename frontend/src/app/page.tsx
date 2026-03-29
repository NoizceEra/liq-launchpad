import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { LaunchForm } from '@/components/LaunchForm';
import { LaunchList } from '@/components/LaunchList';

export default function Page() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <LaunchForm />
      <LaunchList />
    </>
  );
}
