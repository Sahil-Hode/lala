interface StatsProps {
  stats: Array<{ value: string; label: string }>;
}

export default function Stats({ stats }: StatsProps) {
  return (
    <section className="stats" aria-label="Operational metrics">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat reveal">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}
