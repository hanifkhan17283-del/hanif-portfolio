import React, {useContext} from "react";
import emoji from "react-easy-emoji";
import StyleContext from "../../contexts/StyleContext";
import "./ToggleSwitch.css";

const ToggleSwitch = () => {
  const {isDark, changeTheme} = useContext(StyleContext);

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={isDark}
        onChange={changeTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      />
      <span className="slider round">
        <span className="emoji">{isDark ? emoji("🌜") : emoji("☀️")}</span>
      </span>
    </label>
  );
};
export default ToggleSwitch;
