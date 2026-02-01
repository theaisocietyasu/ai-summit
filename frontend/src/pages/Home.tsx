import { useState, useEffect } from "react";
import { apiClient } from "../api";
import "../styles/Home.css";

interface Banner {
  title?: string;
  description?: string;
  banner_url?: string;
}

interface Speaker {
  _id: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string;
}

interface Event {
  _id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  image_url?: string;
  tags: string[];
}

interface Sponsor {
  _id: string;
  name: string;
  tier: string;
  logo_url: string;
  website: string;
}

function Home() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [homeRes, speakersRes, eventsRes, sponsorsRes] = await Promise.all([
        apiClient.getHome(),
        apiClient.getSpeakers(),
        apiClient.getEvents(),
        apiClient.getSponsors(),
      ]);

      if (homeRes.data.banner) {
        setBanner(homeRes.data.banner);
      }
      setSpeakers(speakersRes.data.speakers || []);
      setEvents(eventsRes.data.events || []);
      setSponsors(sponsorsRes.data.sponsors || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const defaultBanner = {
    title: "AI Summit 2025",
    description:
      "Join us for an exciting exploration of artificial intelligence, machine learning, and the future of technology.",
  };

  const bannerData = banner || defaultBanner;

  return (
    <div className="home">
      {/* Banner Section */}
      <section className="banner-section">
        <div className="hero">
          {banner?.banner_url && (
            <img
              src={banner.banner_url}
              alt="Banner"
              className="banner-image"
            />
          )}
          <h1>{bannerData.title}</h1>
          <p>{bannerData.description}</p>
          <a href="/register" target="_blank" className="btn btn-primary">
            Register Now
          </a>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="speakers-section">
        <h2>Featured Speakers</h2>
        <div className="grid">
          {speakers.length > 0 ? (
            speakers.map((speaker) => (
              <div key={speaker._id} className="card">
                {speaker.image_url && (
                  <img src={speaker.image_url} alt={speaker.name} />
                )}
                <h3>{speaker.name}</h3>
                <p className="title">{speaker.title}</p>
                <p className="bio">{speaker.bio}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No speakers available</p>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <h2>Planned Events</h2>
        <div className="grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="card">
                {event.image_url && (
                  <img src={event.image_url} alt={event.name} />
                )}
                <h3>{event.name}</h3>
                <p className="date-time">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
                <p className="description">{event.description}</p>
                {event.tags && event.tags.length > 0 && (
                  <div className="tags">
                    {event.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">No events available</p>
          )}
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="sponsors-section">
        <h2>Our Sponsors</h2>
        {sponsors.length > 0 ? (
          <div className="sponsors-by-tier">
            {["Platinum", "Gold", "Silver", "Bronze"].map((tier) => {
              const tierSponsors = sponsors.filter((s) => s.tier === tier);
              return tierSponsors.length > 0 ? (
                <div key={tier} className="tier-group">
                  <h3>{tier} Sponsors</h3>
                  <div className="sponsors-grid">
                    {tierSponsors.map((sponsor) => (
                      <a
                        key={sponsor._id}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sponsor-card"
                      >
                        <img src={sponsor.logo_url} alt={sponsor.name} />
                        <p>{sponsor.name}</p>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <p className="empty-state">No sponsors available</p>
        )}
      </section>
    </div>
  );
}

export default Home;
