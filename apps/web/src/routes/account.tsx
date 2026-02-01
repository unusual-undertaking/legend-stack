import { createFileRoute, redirect } from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { R2FileUpload } from "@/components/r2-file-upload";

export const Route = createFileRoute("/account")({
  component: Account,
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/sign-in" });
    }
  },
});

function Account() {
  return (
    <Container>
      <R2FileUpload />
    </Container>
  );
}
