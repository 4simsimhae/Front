module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        "black-transparent": "rgba(0,0,0,0.4)",
      },
      keyframes: {
        textToLeftLoop: {
          "0%": {
            transform: "translateX(0px)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        textToRightLoop: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0px)",
          },
        },
        blink: {
          "0%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
      },
      animation: {
        flowTextToLeft: "textToLeftLoop 15s linear infinite",
        flowTextToRight: "textToRightLoop 15s linear infinite",
        blink: "blink 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
