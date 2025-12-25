import { DrawPage } from "@/components/DrawPage";
import { PageTransition } from "@/components/PageTransition";

export default function Draw() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <DrawPage />
      </div>
    </PageTransition>
  );
}

