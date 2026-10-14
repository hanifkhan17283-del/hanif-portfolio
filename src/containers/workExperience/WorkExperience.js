import React, {useCallback, useContext, useState} from "react";
import "./WorkExperience.css";
import ExperienceCard from "../../components/experienceCard/ExperienceCard";
import {workExperiences} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";
import DetailsDialog from "../../components/detailsDialog/DetailsDialog";

export default function WorkExperience() {
  const {isDark} = useContext(StyleContext);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const closeDetails = useCallback(() => setSelectedDetails(null), []);

  if (workExperiences.display) {
    return (
      <>
        <div id="experience">
          <Fade bottom duration={1000} distance="20px">
            <div className="experience-container" id="workExperience">
              <div>
                <h1 className="experience-heading">Experiences</h1>
                <div className="experience-cards-div">
                  {workExperiences.experience.map((card, i) => (
                    <ExperienceCard
                      key={i}
                      isDark={isDark}
                      cardInfo={card}
                      onViewDetails={experience => {
                        setSelectedDetails({
                          title: experience.role,
                          children: (
                            <>
                              <p>
                                <strong>Status:</strong> {experience.date}
                              </p>
                              <p>
                                <strong>Context:</strong> {experience.company}
                              </p>
                              <p>{experience.desc}</p>
                              {experience.skills &&
                              experience.skills.length > 0 ? (
                                <>
                                  <h3>Related skills</h3>
                                  <div className="details-dialog-tags">
                                    {experience.skills.map(skill => (
                                      <span
                                        className="details-dialog-tag"
                                        key={skill}
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              ) : null}
                              {experience.descBullets &&
                              experience.descBullets.length > 0 ? (
                                <>
                                  <h3>Responsibilities and learning focus</h3>
                                  <ul>
                                    {experience.descBullets.map(bullet => (
                                      <li key={bullet}>{bullet}</li>
                                    ))}
                                  </ul>
                                </>
                              ) : null}
                            </>
                          )
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </div>
        <DetailsDialog item={selectedDetails} onClose={closeDetails} />
      </>
    );
  }
  return null;
}
