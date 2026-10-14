import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import Greeting from "./greeting/Greeting";
import Skills from "./skills/Skills";
import StackProgress from "./skillProgress/skillProgress";
import WorkExperience from "./workExperience/WorkExperience";
import Projects from "./projects/Projects";
import StartupProject from "./StartupProjects/StartupProject";
import Achievement from "./achievement/Achievement";
import Blogs from "./blogs/Blogs";
import Footer from "../components/footer/Footer";
import Talks from "./talks/Talks";
import Podcast from "./podcast/Podcast";
import Education from "./education/Education";
import ScrollToTopButton from "./topbutton/Top";
import Twitter from "./twitter-embed/twitter";
import Profile from "./profile/Profile";
import Contact from "./contact/Contact";
import SplashScreen from "./splashScreen/SplashScreen";
import {splashScreen} from "../portfolio";
import {StyleProvider} from "../contexts/StyleContext";
import {useLocalStorage} from "../hooks/useLocalStorage";
import "./Main.css";

const Main = () => {
  const darkPreference =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = useLocalStorage(
    "isDark",
    Boolean(darkPreference && darkPreference.matches)
  );
  const [isShowingSplashAnimation, setIsShowingSplashAnimation] =
    useState(true);

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, [isDark]);

  useEffect(() => {
    if (splashScreen.enabled) {
      const splashTimer = setTimeout(
        () => setIsShowingSplashAnimation(false),
        splashScreen.duration
      );
      return () => {
        clearTimeout(splashTimer);
      };
    }
  }, []);

  const changeTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="theme-root" data-theme={isDark ? "dark" : "light"}>
      <StyleProvider value={{isDark: isDark, changeTheme: changeTheme}}>
        {isShowingSplashAnimation && splashScreen.enabled ? (
          <SplashScreen />
        ) : (
          <>
            <Header />
            <Greeting />
            <Skills />
            <StackProgress />
            <Education />
            <WorkExperience />
            <Projects />
            <StartupProject />
            <Achievement />
            <Blogs />
            <Talks />
            <Twitter />
            <Podcast />
            <Profile />
            <Contact />
            <Footer />
            <ScrollToTopButton />
          </>
        )}
      </StyleProvider>
    </div>
  );
};

export default Main;
