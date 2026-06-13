import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="navy-gradient flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-5xl items-center gap-12">
        <div className="hidden flex-1 flex-col gap-4 text-white lg:flex">
          <span className="text-sm font-medium tracking-[0.3em] text-gold uppercase">
            North Star Hospitality OS
          </span>
          <h1 className="text-4xl font-semibold leading-tight">
            Create your account.
          </h1>
          <p className="max-w-md text-white/70">
            Get full visibility into bookings, revenue, housekeeping and
            guest experience across HH Villa and Giant House.
          </p>
        </div>
        <div className="flex w-full flex-1 justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
