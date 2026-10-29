import TerminalAnimation from './TerminalAnimation';

interface ContactSectionProps {
  title: string;
  text: string;
  email: string;
}

export default function ContactSection({ title, text, email }: ContactSectionProps) {
  return (
    <section className="section" id="channel">
      <div className="section-head reveal">
        <p className="section-kicker">06 // INTAKE</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="contact-block reveal">
        <div>
          <p className="lead" style={{ marginTop: 0 }}>
            {text}
          </p>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
        <TerminalAnimation />
      </div>
    </section>
  );
}
