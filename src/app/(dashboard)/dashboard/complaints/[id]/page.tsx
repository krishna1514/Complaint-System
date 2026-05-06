import ComplaintDetailed from "@/components/dashboard/complaint-individual/complaint-detailed";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ComplaintDetailed id={id} />;
}
