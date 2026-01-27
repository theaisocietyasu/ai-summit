"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./BannerHero.module.css";
import { getHome } from "@/app/lib/api";

interface Banner {
  banner_title: string;
  banner_description: string;
  banner_url: string;
}

export default function BannerHero() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response: any = await getHome();
        if (response.success && response.data?.banner) {
          setBanner(response.data.banner);
        }
      } catch (error) {
        console.error("Failed to load banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : banner ? (
          <>
            <img
              src={banner.banner_url}
              alt={banner.banner_title}
              className={styles.bannerImage}
            />
            <h1>{banner.banner_title}</h1>
            <p>{banner.banner_description}</p>
            <Link href="/register" className={styles.btn}>
              Register Now
            </Link>
          </>
        ) : (
          <>
            <h1>AI Summit 2025</h1>
            <p>
              Join us for an exciting exploration of artificial intelligence,
              machine learning, and the future of technology.
            </p>
            <Link href="/register" className={styles.btn}>
              Register Now
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
