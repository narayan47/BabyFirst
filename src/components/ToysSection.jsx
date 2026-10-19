
import React from "react";
import "./ToysSection.css";

export default function ToysSection() {
  return (
    <section className="toys-section" id="playroom">
      <div className="toys-content">
        <span className="toys-label">✦ A LITTLE MORE MAGIC ✦</span>

        <h2>Ready to Play?</h2>

        <p>
          Take a break from exploring and enter the playroom.
          Catch stars, match dreamy pairs, build towers, and pop bubbles!
        </p>

        <a href="/home" className="toys-play-button">
          Play Games <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
