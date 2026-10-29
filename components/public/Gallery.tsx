import Image from 'next/image';
import { GalleryItem } from '@/types/database';

interface GalleryProps {
  title: string;
  items: GalleryItem[];
}

export default function Gallery({ title, items }: GalleryProps) {
  return (
    <section className="section" id="surveillance">
      <div className="section-head reveal">
        <p className="section-kicker">03 // EYES ON</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="gallery-grid">
        {items.length === 0 ? (
          <p className="lead">No surveillance assets published.</p>
        ) : (
          items.map((item) => (
            <figure key={item.id} className="gallery-item reveal">
              <Image
                src={item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}
                alt={item.title}
                width={640}
                height={400}
                unoptimized
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="gallery-tag">{item.category}</span>
              <figcaption className="gallery-meta">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </figcaption>
            </figure>
          ))
        )}
      </div>
    </section>
  );
}
