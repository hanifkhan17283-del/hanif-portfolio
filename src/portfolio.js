/* Change this file to get your personal Portfolio */

// Global theme tokens are defined in index.css.

import emoji from "react-easy-emoji";
import splashAnimation from "./assets/lottie/splashAnimation"; // Rename to your file name for custom animation

// Splash Screen

const splashScreen = {
  enabled: true, // set false to disable splash screen
  animation: splashAnimation,
  duration: 2000 // Set animation duration as per your animation
};

// Summary And Greeting Section

const illustration = {
  animated: true // Set to false to use static SVG
};

const greeting = {
  username: "Hanif Muhammad",
  title: "Hi, I'm Hanif Muhammad",
  subTitle: emoji(
    "Computer Science student at UET Mardan focused on Python, AI, Machine Learning, Data Science, and workflow automation. I build practical projects around data-driven solutions, intelligent tools, and digital workflows while continuously learning and improving my skills in web development and automation."
  ),
  resumeLink: "/Hanif_Muhammad_Professional_CV.docx",
  displayGreeting: true
};

// Social Media Links

const socialMediaLinks = {
  github: "https://github.com/hanifkhan17283-del",
  linkedin: "https://www.linkedin.com/in/hanif-khan-770b57354",
  gmail: "hanifkhan17283@gmail.com",
  gitlab: "https://gitlab.com/hanifmuhammad",
  facebook: "https://www.facebook.com/hanif.muhammad",
  medium: "https://medium.com/@hanifmuhammad",
  stackoverflow: "https://stackoverflow.com/users/10422806/hanif-muhammad",
  display: true
};

// Skills Section

const skillsSection = {
  title: "What I do",
  subTitle:
    "I build practical solutions in Python, artificial intelligence, automation, and web development for modern digital workflows.",
  skills: [
    emoji("⚡ Python development for automation, data analysis, and intelligent systems."),
    emoji("⚡ AI and machine learning projects focused on real-world problem solving."),
    emoji("⚡ Workflow automation using n8n to connect tools, data, and business processes."),
    emoji("⚡ Web interfaces and data-centric experiences for projects and digital products.")
  ],

  softwareSkills: [
    {
      skillName: "Python",
      fontAwesomeClassname: "fab fa-python"
    },
    {
      skillName: "AI & ML",
      fontAwesomeClassname: "fas fa-brain"
    },
    {
      skillName: "Data Science",
      fontAwesomeClassname: "fas fa-chart-line"
    },
    {
      skillName: "n8n",
      fontAwesomeClassname: "fas fa-network-wired"
    },
    {
      skillName: "JavaScript",
      fontAwesomeClassname: "fab fa-js"
    },
    {
      skillName: "React",
      fontAwesomeClassname: "fab fa-react"
    },
    {
      skillName: "HTML5",
      fontAwesomeClassname: "fab fa-html5"
    },
    {
      skillName: "CSS3",
      fontAwesomeClassname: "fab fa-css3-alt"
    },
    {
      skillName: "Git",
      fontAwesomeClassname: "fab fa-git-alt"
    },
    {
      skillName: "GitHub",
      fontAwesomeClassname: "fab fa-github"
    },
    {
      skillName: "GitLab",
      fontAwesomeClassname: "fab fa-gitlab"
    },
    {
      skillName: "Automation",
      fontAwesomeClassname: "fas fa-cogs"
    }
  ],
  display: true
};
// Education Section
const educationInfo = {
  display: true,
  schools: [
    {
      schoolName: "University of Engineering and Technology (UET), Mardan",
      logo: require("./assets/images/UETMardan.png"),
      subHeader: "Computer Science",
      duration: "Currently Studying",
      desc: "Studying Computer Science with growing interest in Artificial Intelligence, Machine Learning, Data Science, and software development.",
      descBullets: [
        "Developing strong fundamentals in programming, problem solving, and data-driven thinking.",
        "Exploring AI/ML, web development, and automation workflows through ongoing projects and learning."
      ]
    }
  ]
};
// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: true,
  experience: [
    {
      Stack: "Python",
      progressPercentage: "70%"
    },
    {
      Stack: "n8n Workflow Automation",
      progressPercentage: "80%"
    },
    {
      Stack: "Machine Learning",
      progressPercentage: "70%"
    },
    {
      Stack: "Artificial Intelligence",
      progressPercentage: "75%"
    },
    {
      Stack: "Data Science",
      progressPercentage: "80%"
    }
  ],
  displayCodersrank: false
};
// Work Experience Section

const workExperiences = {
  display: true,
  experience: [
    {
      role: "AI & Machine Learning Project Developer",
      company: "Personal Project",
      companylogo: require("./assets/images/ai-ml-experience.png.jpg"),
      date: "Ongoing Learning",
      desc: "Building practical AI and machine learning projects while improving Python skills, data handling, model development, and evaluation workflows.",
      descBullets: [
        "Exploring face and emotion recognition use cases.",
        "Practicing model training, evaluation, and interpretation of results.",
        "Applying AI concepts to small real-world problem-solving projects."
      ],
      skills: ["Python", "Data handling", "Model development", "Model evaluation"]
    },
    {
      role: "Workflow Automation Developer",
      company: "Personal Project",
      companylogo: require("./assets/images/workflow-automation.png.png"),
      date: "Ongoing Learning",
      desc: "Exploring workflow automation with n8n and Python to streamline repetitive digital tasks, connect tools, and improve operational efficiency.",
      descBullets: [
        "Designing automation ideas for lead capture, email workflows, and social publishing.",
        "Connecting APIs and services through practical automation experiments."
      ],
      skills: ["n8n", "Python", "API integrations", "Workflow automation"]
    },
    {
      role: "Web Developer",
      company: "Personal Project",
      companylogo: require("./assets/images/web-development.png.png"),
      date: "Project-Based Learning",
      desc: "Developing frontend skills through portfolio projects and UI-focused builds using modern web technologies.",
      descBullets: [
        "Practicing HTML, CSS, JavaScript, and React.",
        "Improving responsive design and project-based problem solving."
      ],
      skills: ["HTML", "CSS", "JavaScript", "React", "Responsive design"]
    }
  ]
};

/* Your Open Source Section to View Your Github Pinned Projects
To know how to get github key look at readme.md */

const openSource = {
  showGithubProfile: "true", // Set true or false to show Contact profile using Github, defaults to true
  display: true // Set false to hide this section, defaults to true
};

// Some big projects you have worked on

const bigProjects = {
  title: "My Projects",
  subtitle: "AI, MACHINE LEARNING, PYTHON, AND AUTOMATION WORKFLOWS",
  projects: [
    {
      image: require("./assets/images/face-detection.png"),
      projectName: "Face Detection System",
      projectDesc: "A computer vision project focused on detecting human faces in images or video using Python and image-processing techniques.",
      technologies: ["Python", "Image processing"],
      footerLink: []
    },
    {
      image: require("./assets/images/emotion-detection-ai.png"),
      projectName: "Emotion Detection AI",
      projectDesc: "An AI project that classifies facial expressions into emotion categories using machine learning and image-based analysis.",
      technologies: ["Machine learning", "Image-based analysis"],
      footerLink: []
    },
    {
      image: require("./assets/images/house-price-prediction.png"),
      projectName: "House Price Prediction",
      projectDesc: "A machine learning project that estimates property prices from selected features using data preparation and model evaluation.",
      technologies: ["Machine learning", "Data preparation", "Model evaluation"],
      footerLink: []
    },
    {
      image: require("./assets/images/social-media-automation.png"),
      projectName: "Social Media Automation with n8n",
      projectDesc: "A workflow-based automation project for organizing social media publishing tasks and connecting common digital tools.",
      technologies: ["n8n", "Workflow automation"],
      footerLink: []
    },
    {
      image: require("./assets/images/company-website-chatbot.png"),
      projectName: "Website Chatbot",
      projectDesc: "A chatbot concept designed to assist website visitors with common questions and navigation-related support.",
      technologies: [],
      footerLink: []
    },
    {
      image: require("./assets/images/lead-generation-automation.png"),
      projectName: "Lead Generation Automation",
      projectDesc: "An n8n-driven workflow concept for collecting, organizing, and following up on leads from approved sources.",
      technologies: ["n8n", "Workflow automation"],
      footerLink: []
    },
    {
      image: require("./assets/images/email-automation-n8n.png"),
      projectName: "Email Automation with n8n",
      projectDesc: "An automation workflow for sending and organizing email-based notifications, updates, and follow-ups using triggers.",
      technologies: ["n8n", "Email workflow automation"],
      footerLink: []
    }
  ],
  display: true
};
// Achievement Section

const achievementSection = {
  title: emoji("Achievements & Learning 🏆"),
  subtitle:
    "Core learning milestones in Machine Learning, Python programming, and workflow automation.",

  achievementsCards: [
    {
      title: "Machine Learning",
      subtitle:
        "Focused learning in machine learning fundamentals, model concepts, and predictive problem solving.",
      image: require("./assets/images/machine-learning.png"),
      imageAlt: "Machine Learning learning path",
      footerLink: []
    },
    {
      title: "Python Programming",
      subtitle:
        "Building confidence in Python fundamentals, scripting, and practical coding workflows.",
      image: require("./assets/images/python-programming.png"),
      imageAlt: "Python learning path",
      footerLink: []
    },
    {
      title: "n8n Workflow Automation Achievement",
      subtitle:
        "A workflow automation visual representing ongoing learning in n8n integrations and process design; this is not a verified certification.",
      image: require("./assets/images/n8n-workflow-automation.png.png"),
      imageAlt: "n8n workflow automation learning",
      footerLink: []
    }
  ],
  display: true
};
// Blogs & Developer Profiles Section

const blogSection = {
  title: "Blogs & Developer Profiles",
  subtitle:
    "Explore my technical learning journey, projects, code, and developer contributions.",

  displayMediumBlogs: "false",

  blogs: [
    {
      url: "https://medium.com/@hanifkhan17283",
      title: "My Medium Profile",
      description:
        "Explore my profile for technical articles, programming insights, and learning experiences."
    },
    {
      url: "https://github.com/hanifkhan17283-del",
      title: "GitHub — My Projects",
      description:
        "Explore my repositories, programming projects, and experiments in software development."
    },
    {
      url: "https://gitlab.com/hanifkhan17283-del",
      title: "GitLab — My Repositories",
      description:
        "Visit my GitLab profile to explore repositories and development work."
    },
    {
      url: "https://stackoverflow.com/users/33205051/hanif-muhammad",
      title: "Stack Overflow Profile",
      description:
        "View my developer profile, programming questions, answers, and community activity."
    }
  ],

  display: true
};
// Talks Section

const talkSection = {
  title: "Learning & Knowledge Sharing",
  subtitle: emoji(
    "I enjoy learning new technologies, sharing knowledge, and growing with the developer community."
  ),

  talks: [],

  display: false
};
// Podcast Section

const podcastSection = {
  title: emoji("Podcast 🎙️"),
  subtitle:
    "Exploring Artificial Intelligence, Machine Learning, Python, and Workflow Automation.",

  podcast: [],

  display: false
};
// Resume Section
const resumeSection = {
  title: "My Resume",
  subtitle:
    "Explore my education, technical skills, projects, and learning journey.",
  display: true
};

const contactInfo = {
  title: emoji("Contact Me ☎️"),
  subtitle:
    "Open to internships, project collaborations, learning opportunities, and AI, automation, or data-driven development work.",
  number: "03184345644",
  email_address: "hanifkhan17283@gmail.com"
};
// Twitter Section

const twitterDetails = {
  userName: "twitter", //Replace "twitter" with your twitter username without @
  display: true // Set true to display this section, defaults to false
};

const isHireable = false; // Set false if you are not looking for a job. Also isHireable will be display as Open for opportunities: Yes/No in the GitHub footer

export {
  illustration,
  greeting,
  socialMediaLinks,
  splashScreen,
  skillsSection,
  educationInfo,
  techStack,
  workExperiences,
  openSource,
  bigProjects,
  achievementSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails,
  isHireable,
  resumeSection
};
