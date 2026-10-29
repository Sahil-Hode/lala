import UtcClock from './UtcClock';

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        SYS // <span>ACTIVE</span>
      </div>
      <nav>
        <ul className="topnav">
          <li><a href="#agency">Agency</a></li>
          <li><a href="#capabilities">Capabilities</a></li>
          <li><a href="#surveillance">Surveillance</a></li>
          <li><a href="#intel">Intel</a></li>
          <li><a href="#comms">Comms</a></li>
          <li><a href="#channel">Channel</a></li>
        </ul>
      </nav>
      <UtcClock />
    </header>
  );
}
