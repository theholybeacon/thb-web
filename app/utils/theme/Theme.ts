import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
    fontFamily: "Roboto,sans-serif",
    headings: {
        fontFamily: "Oswald,sans-serif",
        sizes: {
            h1: { fontSize: rem(36) },
        },
    },
    autoContrast:true,
    white: "#B7B795",
    black: "#0F2033",
    colors: {
        primary: [
            "#e6f8ff",
            "#dbebf2",
            "#bdd2dd",
            "#9bb9c8",
            "#7fa4b6",
            "#6c96ab",
            "#6090a7",
            "#4e7c93",
            "#416f85",
            "#2d6077"
        ],
        secondary: [
            "#fff5e6",
            "#f5e9d8",
            "#e5d2b5",
            "#d6b98d",
            "#c9a46c",
            "#c19656",
            "#be8f4a",
            "#a77c3b",
            "#956e31",
            "#825e24"
        ],
        accent: [
            "#fcfbe5",
            "#f7f5d4",
            "#eee9ab",
            "#e4dd7f",
            "#dcd35a",
            "#d7cd42",
            "#d4ca34",
            "#bbb225",
            "#a69e1c",
            "#8f880a"
        ],
        dark: [
            '#0F2033', // Base Color
            '#0D1C2F',
            '#0B192C',
            '#091629',
            '#071326',
            '#050F23',
            '#040B20',
            '#03081D',
            '#02061A',
            '#010417',
        ],
        light: [
            '#B7B795', // Base Color
            '#A5A586',
            '#929277',
            '#808068',
            '#6E6E59',
            '#5C5C4A',
            '#49493C',
            '#37372D',
            '#25251E',
            '#12120F',
        ]
    },
    primaryColor: "primary",

});

