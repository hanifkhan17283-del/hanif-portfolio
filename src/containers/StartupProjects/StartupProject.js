import React, {useCallback, useContext, useState} from "react";
import "./StartupProjects.css";
import {bigProjects} from "../../portfolio";
import {Fade} from "react-reveal";
import StyleContext from "../../contexts/StyleContext";
import DetailsDialog from "../../components/detailsDialog/DetailsDialog";

export default function StartupProject() {
  const {isDark} = useContext(StyleContext);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const closeDetails = useCallback(() => setSelectedDetails(null), []);

  if (!bigProjects.display) {
    return null;
  }
  return (
    <>
      <Fade bottom duration={1000} distance="20px">
        <div className="main" id="projects">
          <div>
            <h1 className="skills-heading">{bigProjects.title}</h1>
            <p
              className={
                isDark
                  ? "dark-mode project-subtitle"
                  : "subTitle project-subtitle"
              }
            >
              {bigProjects.subtitle}
            </p>

            <div className="projects-container">
              {bigProjects.projects.map((project, i) => (
                <article
                  key={i}
                  className={
                    isDark
                      ? "dark-mode project-card project-card-dark"
                      : "project-card project-card-light"
                  }
                >
                  {project.image ? (
                    <div className="project-image">
                      <img
                        src={project.image}
                        alt={project.projectName}
                        className="project-image-content"
                      ></img>
                    </div>
                  ) : null}
                  <div className="project-detail">
                    <h5
                      className={isDark ? "dark-mode card-title" : "card-title"}
                    >
                      {project.projectName}
                    </h5>
                    <button
                      className="details-action-button project-details-button"
                      type="button"
                      aria-label={`View project details for ${project.projectName}`}
                      onClick={() =>
                        setSelectedDetails({
                          title: project.projectName,
                          children: (
                            <>
                              {project.image ? (
                                <img
                                  className="details-dialog-image"
                                  src={project.image}
                                  alt={`${project.projectName} project`}
                                />
                              ) : null}
                              <h3>Project overview</h3>
                              <p>{project.projectDesc}</p>
                              <h3>Documented technologies and methods</h3>
                              {project.technologies &&
                              project.technologies.length > 0 ? (
                                <div className="details-dialog-tags">
                                  {project.technologies.map(technology => (
                                    <span
                                      className="details-dialog-tag"
                                      key={technology}
                                    >
                                      {technology}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p>
                                  No specific technologies are documented for
                                  this project.
                                </p>
                              )}
                              <p>
                                Further implementation details are not
                                documented in the current project information.
                              </p>
                              {project.footerLink &&
                              project.footerLink.some(link => link.url) ? (
                                <>
                                  <h3>Project links</h3>
                                  <div className="details-dialog-links">
                                    {project.footerLink
                                      .filter(link => link.url)
                                      .map((link, linkIndex) => (
                                        <a
                                          className="details-action-button"
                                          href={link.url}
                                          key={linkIndex}
                                          rel="noreferrer"
                                          target="_blank"
                                        >
                                          {link.name}
                                        </a>
                                      ))}
                                  </div>
                                </>
                              ) : (
                                <p>
                                  No repository or live demo link is currently
                                  listed for this project.
                                </p>
                              )}
                            </>
                          )
                        })
                      }
                    >
                      View Project
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Fade>
      <DetailsDialog item={selectedDetails} onClose={closeDetails} />
    </>
  );
}
