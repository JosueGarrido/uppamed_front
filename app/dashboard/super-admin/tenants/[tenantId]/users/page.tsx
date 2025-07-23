export default function Page({ params }: { params: { tenantId: string } }) {
  return <div>Tenant ID: {params.tenantId}</div>;
} 