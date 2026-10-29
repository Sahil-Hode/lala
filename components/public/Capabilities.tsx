interface CapabilityItem {
  title: string;
  text: string;
}

interface CapabilitiesProps {
  title: string;
  services: CapabilityItem[];
}

export default function Capabilities({ title, services }: CapabilitiesProps) {
  return (
    <section className="section" id="capabilities">
      <div className="section-head reveal">
        <p className="section-kicker">02 // DOCTRINE</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="capability-grid reveal">
        {services.map((service, idx) => (
          <article key={idx} className="capability">
            <div className="cap-index">MODULE 0{idx + 1}</div>
            <h3 className="cap-title">{service.title}</h3>
            <p className="cap-text">{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
