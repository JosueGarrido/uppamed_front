export default function Page({ params }: { params: { tenant: string } }) {
    return <div>Tenant ID: {params.tenant}</div>;
  }