import React, {useCallback, useContext, useState} from "react";
import "./Skills.css";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import {illustration, skillsSection} from "../../portfolio";
import {Fade} from "react-reveal";
import codingPerson from "../../assets/lottie/codingPerson";
import DisplayLottie from "../../components/displayLottie/DisplayLottie";
import StyleContext from "../../contexts/StyleContext";
import DetailsDialog from "../../components/detailsDialog/DetailsDialog";

const aboutItems = [
  {
    title: "Python Development",
    relatedSkills: ["Python", "Data Science", "Automation"]
  },
  {
    title: "AI & Machine Learning",
    relatedSkills: ["AI & ML", "Data Science", "Python"]
  },
  {
    title: "Workflow Automation",
    relatedSkills: ["n8n", "Automation", "Python"]
  },
  {
    title: "Web Development",
    relatedSkills: ["JavaScript", "React", "HTML5", "CSS3"]
  }
];

export default function Skills() {
  const {isDark} = useContext(StyleContext);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const closeDetails = useCallback(() => setSelectedDetails(null), []);

  if (!skillsSection.display) {
    return null;
  }
  return (
    <>
      <div className={isDark ? "dark-mode main" : "main"} id="skills">
        <div className="skills-main-div">
          <Fade left duration={1000}>
            <div className="skills-image-div">
              {illustration.animated ? (
                <DisplayLottie animationData={codingPerson} />
              ) : (
                <img
                  alt="Man Working"
                  src={require("../../assets/images/developerActivity.svg")}
                ></img>
              )}
            </div>
          </Fade>
          <Fade right duration={1000}>
            <div className="skills-text-div">
              <h1
                className={
                  isDark ? "dark-mode skills-heading" : "skills-heading"
                }
              >
                {skillsSection.title}{" "}
              </h1>
              <p
                className={
                  isDark
                    ? "dark-mode subTitle skills-text-subtitle"
                    : "subTitle skills-text-subtitle"
                }
              >
                {skillsSection.subTitle}
              </p>
              <SoftwareSkill />
              <div className="about-details-grid">
                {skillsSection.skills.map((skill, i) => {
                  const item = aboutItems[i];
                  return (
                    <article className="about-details-card" key={item.title}>
                      <h2>{item.title}</h2>
                      <p
                        className={
                          isDark
                            ? "dark-mode subTitle skills-text"
                            : "subTitle skills-text"
                        }
                      >
                        {skill}
                      </p>
                      <button
                        className="details-action-button"
                        type="button"
                        aria-label={`Learn more about ${item.title}`}
                        onClick={() =>
                          setSelectedDetails({
                            title: item.title,
                            children: (
                              <>
                                <p>{skill}</p>
                                <h3>Related skills</h3>
                                <div className="details-dialog-tags">
                                  {item.relatedSkills.map(relatedSkill => (
                                    <span
                                      className="details-dialog-tag"
                                      key={relatedSkill}
                                    >
                                      {relatedSkill}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )
                          })
                        }
                      >
                        Learn More
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </Fade>
        </div>
      </div>
      <DetailsDialog item={selectedDetails} onClose={closeDetails} />
    </>
  );
}
