import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Easy to Use",
    description: (
      <>
        REST2TS is designed to be easy to use. You can generate TypeScript types
        from REST APIs with a single command.
      </>
    ),
  },
  {
    title: "Simple but Powerful configuration",
    description: (
      <>
        REST2TS has a simple but powerful configuration. You can use middlewares
        to enhance your API calls.
      </>
    ),
  },
  {
    title: "Complex Types Support",
    description: (
      <>
        No matter how complex your API responses are, REST2TS can handle them,
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
