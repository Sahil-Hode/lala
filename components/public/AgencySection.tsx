interface AgencySectionProps {
  title: string;
  text: string;
}

export default function AgencySection({ title, text }: AgencySectionProps) {
  return (
    <section className="section" id="agency">
      <div className="section-head reveal">
        <p className="section-kicker">01 // ORIGIN</p>
        <h2 className="section-title">{title}</h2>
        <p className="lead">{text}</p>
      </div>
    </section>
  );
}
