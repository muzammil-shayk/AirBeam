import React from "react";
import { Zap, Shield, Cloud, Smartphone, Lock, Globe } from "lucide-react";
import { WHY, FEATURES } from "../content.js";

// One icon per feature, in the same order as FEATURES.
const ICONS = [
  <Zap key="zap" className="h-6 w-6" aria-hidden="true" />,
  <Shield key="shield" className="h-6 w-6" aria-hidden="true" />,
  <Cloud key="cloud" className="h-6 w-6" aria-hidden="true" />,
  <Smartphone key="phone" className="h-6 w-6" aria-hidden="true" />,
  <Lock key="lock" className="h-6 w-6" aria-hidden="true" />,
  <Globe key="globe" className="h-6 w-6" aria-hidden="true" />,
];

/**
 * SEOSection - keyword-rich feature list for users and search indexers.
 * Copy lives in content.js.
 */
const SEOSection = () => {
  return (
    <section className="why" aria-labelledby="why-title">
      <div className="why__head">
        <h2 id="why-title" className="why__title">
          {WHY.title}
        </h2>
        <p className="why__intro">{WHY.intro}</p>
      </div>

      <ul className="why__grid">
        {FEATURES.map((feature, idx) => (
          <li key={feature.title} className="why__card">
            <div className="why__chip">{ICONS[idx]}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SEOSection;
