import { Presentation } from "@/components/Presentation";
import { ErrorBoundary } from "@/components/stage/ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <Presentation />
    </ErrorBoundary>
  );
}
