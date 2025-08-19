import { UserSelection } from '@/components/user-selection';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <UserSelection />
    </div>
  );
}
