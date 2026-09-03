import type { ReactNode } from "react";

interface CheckinStateScreenProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  role?: "status" | "alert";
}

export function CheckinStateScreen({
  eyebrow = "홈투게더 정기 체크인",
  title,
  description,
  action,
  role = "status",
}: CheckinStateScreenProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-grayscale-70 px-5 py-10">
      <section
        className="w-full max-w-[480px] rounded-2xl bg-grayscale-0 px-6 py-8 shadow-toast"
        role={role}
      >
        <div
          className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary-100 text-headline-1 font-bold text-primary-600"
          aria-hidden="true"
        >
          홈
        </div>
        <p className="mb-2 text-label-1 font-medium text-primary-600">{eyebrow}</p>
        <h1 className="text-heading-1 font-semibold text-grayscale-900">{title}</h1>
        {description && <p className="mt-3 text-body-1 text-grayscale-600">{description}</p>}
        {action && <div className="mt-7">{action}</div>}
      </section>
    </main>
  );
}
