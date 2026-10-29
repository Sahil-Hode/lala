import Header from '@/components/public/Header';
import Hero from '@/components/public/Hero';
import Stats from '@/components/public/Stats';
import AgencySection from '@/components/public/AgencySection';
import Capabilities from '@/components/public/Capabilities';
import Gallery from '@/components/public/Gallery';
import IntelFeeds from '@/components/public/IntelFeeds';
import ChatDump from '@/components/public/ChatDump';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import ScrollObserver from '@/components/public/ScrollObserver';
import {
  getSiteContent,
  getActiveGalleryItems,
  getActiveIntelFeeds,
  getChatThreads,
} from '@/lib/queries';


export default async function HomePage() {
  const [content, gallery, feeds, chatThreads] = await Promise.all([
    getSiteContent(),
    getActiveGalleryItems(),
    getActiveIntelFeeds(),
    getChatThreads(true),
  ]);

  const siteName = content.site_name || 'NEXUS INTEL';
  const siteTagline = content.site_tagline || 'CLASSIFIED // GLOBAL THREAT INTELLIGENCE';
  const heroTitle = content.hero_title || 'SURVEILLANCE. ANALYSIS. DOMINANCE.';
  const heroSubtitle =
    content.hero_subtitle ||
    'Real-time cyber threat intelligence for nation-state defence, enterprise security, and dark-net monitoring operations.';
  const heroCta = content.hero_cta || 'ACCESS BRIEFING';

  const stats = [
    { value: content.stat_1_value || '14.2K', label: content.stat_1_label || 'THREATS NEUTRALIZED' },
    { value: content.stat_2_value || '97%', label: content.stat_2_label || 'DETECTION RATE' },
    { value: content.stat_3_value || '48', label: content.stat_3_label || 'ACTIVE THEATERS' },
    { value: content.stat_4_value || '24/7', label: content.stat_4_label || 'SOC COVERAGE' },
  ];

  const services = [
    { title: content.service_1_title || 'THREAT HUNTING', text: content.service_1_text || '' },
    { title: content.service_2_title || 'DARK WEB INTEL', text: content.service_2_text || '' },
    { title: content.service_3_title || 'INCIDENT RESPONSE', text: content.service_3_text || '' },
    { title: content.service_4_title || 'RED TEAM OPS', text: content.service_4_text || '' },
  ];

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <div className="site-wrap">
        <Header />

        <Hero
          siteName={siteName}
          siteTagline={siteTagline}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          heroCta={heroCta}
        />

        <Stats stats={stats} />

        <AgencySection
          title={content.about_title || 'THE AGENCY'}
          text={
            content.about_text ||
            'NEXUS INTEL operates at the intersection of signals intelligence, cyber warfare, and strategic counter-espionage.'
          }
        />

        <Capabilities
          title={content.services_title || 'CAPABILITY MATRIX'}
          services={services}
        />

        <Gallery
          title={content.gallery_title || 'FIELD SURVEILLANCE'}
          items={gallery}
        />

        <IntelFeeds
          title={content.feeds_title || 'LIVE INTEL STREAM'}
          feeds={feeds}
        />

        <ChatDump
          chatTitle={content.chat_title || 'WHATSAPP EXTRACTION'}
          chatSubtitle={
            content.chat_subtitle ||
            'Target handset dump — all chats pulled from the extracted number.'
          }
          sourcePhone={content.chat_source_phone || '+91 9906451074'}
          chatStatus={content.chat_status || 'EXTRACTION COMPLETE'}
          toolBanner={content.chat_tool_banner || 'DARKSCAN v4.2.1 - SESSION ENCRYPTED'}
          threads={chatThreads}
        />

        <ContactSection
          title={content.contact_title || 'SECURE CHANNEL'}
          text={
            content.contact_text ||
            'Encrypted intake only. Clearance Level 3 required for operational briefings.'
          }
          email={content.contact_email || 'secure@nexus-intel.ops'}
        />

        <Footer
          text={
            content.footer_text ||
            'NEXUS INTEL // CLASSIFIED OPERATIONS // UNAUTHORIZED ACCESS PROHIBITED'
          }
        />
      </div>

      <ScrollObserver />
    </>
  );
}
