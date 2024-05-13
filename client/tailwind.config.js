module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        150: "150px",
        190: "190px",
        225: "225px",
        275: "275px",
        300: "300px",
        340: "340px",
        350: "350px",
        375: "375px",
        460: "460px",
        656: "656px",
        880: "880px",
        508: "508px",
      },
      height: {
        80: "80px",
        150: "150px",
        225: "225px",
        300: "300px",
        340: "340px",
370: "370px",
        420: "420px",
        510: "510px",
        600: "600px",
        650: "650px",
        685: "685px",
        800: "800px",
        "99vh": "99vh",
      },
      minWidth: {
        210: "210px",
        350: "350px",
        620: "620px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        // Spotify Theme Colors
        headingColor: "#1DB954", //


textColor: "#FFFFFF", // White
        cartNumBg: "#1DB954", // Green
        primary: "#191414", // Black
        cardOverlay: "rgba(0, 0, 0, 0.6)", // Black with opacity
        darkOverlay: "rgba(0, 0, 0, 0.5)", // Black with opacity
        lightOverlay: "rgba(0, 0, 0, 0.1)", // Black with very low opacity
        lighttextGray: "#9ca0b", // Gray
        card: "#000000", // Black
        cartBg: "#191414", // Black
        cartItem: "#121212",

        cartTotal: "#000000", // Black
        loaderOverlay: "rgba(0, 0, 0, 0.1)", // Black with low opacity
      },
    },
  },
  plugins: [],
};

