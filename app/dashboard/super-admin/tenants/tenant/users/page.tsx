export default async function Page({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  return <div>Tenant ID: {tenant}</div>;
}