import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";
import DonateButton from "@site/src/components/LN/DonateButton";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>

        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro/setup"
          >
            Start now
          </Link>
        </div>
        <br />
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Generate modern TypeScript types from REST APIs"
    >
      <HomepageHeader />

      <main>
        <HomepageFeatures />

        <div className={styles.buttons}>
          <a href="https://www.buymeacoffee.com/gaboe">
            <img src="https://img.buymeacoffee.com/button-api/?text=Coffee for TS types&emoji=☕&slug=gaboe&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" />
          </a>
          <DonateButton />
        </div>
      </main>
    </Layout>
  );
}
