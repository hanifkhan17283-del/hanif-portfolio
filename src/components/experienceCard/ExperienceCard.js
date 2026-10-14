import React from "react";
import "./ExperienceCard.css";

export default function ExperienceCard({cardInfo, isDark, onViewDetails}) {
  return (
    <article
      className={`experience-card${isDark ? " experience-card-dark" : ""}`}
    >
      <div className="experience-card-image">
        <img
          className="experience-card-image-content"
          src={cardInfo.companylogo}
          alt=""
        />
      </div>
      <div className="experience-card-content">
        <h2 className="experience-text-role">
          {cardInfo.role}
        </h2>
        <button
          className="details-action-button experience-details-button"
          type="button"
          aria-label={`View details for ${cardInfo.role}`}
          onClick={() => onViewDetails(cardInfo)}
        >
          View Details
        </button>
      </div>
    </article>
  );
}
