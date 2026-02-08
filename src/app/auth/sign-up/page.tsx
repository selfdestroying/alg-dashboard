"use client";

import SignUp from "./_components/sign-up";

export default function Page() {
  return (
    <div className="w-full">
      <div className="flex items-center flex-col justify-center w-full md:py-10">
        <div className="w-full max-w-md">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
