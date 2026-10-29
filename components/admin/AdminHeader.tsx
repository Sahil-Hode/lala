interface AdminHeaderProps {
  pageTitle: string;
  username?: string;
  flash?: { type: 'ok' | 'err'; message: string } | null;
}

export default function AdminHeader({
  pageTitle,
  username = 'admin',
  flash,
}: AdminHeaderProps) {
  return (
    <>
      <div className="main-header">
        <div>
          <h1>{pageTitle}</h1>
          <div className="sub">OPERATOR // {username}</div>
        </div>
      </div>
      {flash && (
        <div className={`flash ${flash.type === 'ok' ? 'ok' : 'err'}`}>
          {flash.message}
        </div>
      )}
    </>
  );
}
