import { ParticipantsPage } from "@/components/ParticipantsPage";
import { PageTransition } from "@/components/PageTransition";

export default function Participants() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <ParticipantsPage />
      </div>
    </PageTransition>
  );
}

