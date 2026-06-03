export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <div className="panel mt-4 p-6">
        <p className="text-sm text-slate-500">This module is planned for the next backend expansion.</p>
      </div>
    </section>
  );
}
