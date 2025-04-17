const setTheme = () => {
  const toggleTheme = document.querySelector("#toggleThemeBtn");
  // Check if the user has a theme preference saved in localStorage
  const theme = localStorage.getItem("theme");
  // If no preference is saved, check the user's system preference
  if (theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    toggleTheme.innerHTML = theme === "dark" ? "🌙 Dark" : "☀️ Light";
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
    toggleTheme.innerHTML = "🌙 Dark";
  } else {
    document.documentElement.classList.remove("dark");
    toggleTheme.innerHTML = "☀️ Light";
  }

  toggleTheme.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.contains("dark")?
        toggleTheme.innerHTML = "☀️ Light":
            toggleTheme.innerHTML="🌙 Dark"
            
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );

    
  });
};
setTheme();
