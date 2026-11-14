import { Suspense } from "react";
import { UserDetailsPage } from "@acadly/modules/admin/users/components/UserDetailsPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type UserDetailsProps = {
  params: Promise<{ id: string }>;
};

export default function UserDetailsRoute({ params }: UserDetailsProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading user profile…" />}>
      <UserRoute params={params} />
    </Suspense>
  );
}

async function UserRoute({ params }: UserDetailsProps) {
  const { id } = await params;
  return <UserDetailsPage userId={id} />;
}
