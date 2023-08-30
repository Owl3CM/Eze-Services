import React from "react";

type Props = {};

const ToggleTheme = (props: Props) => {
  const [theme, setTheme] = React.useState(document.documentElement.classList.contains("dark") ? "dark" : "light");

  return (
    <p
      onClick={() => {
        const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(newTheme);
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
      }}
      className="toggle-theme-button">
      {theme === "dark" ? "🌙" : "🌞"}
    </p>
  );
};

export default ToggleTheme;
