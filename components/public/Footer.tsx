interface FooterProps {
  text: string;
}

export default function Footer({ text }: FooterProps) {
  return (
    <footer className="site-footer">
      <span>{text}</span>
      <span>CLEARANCE REQUIRED</span>
    </footer>
  );
}
