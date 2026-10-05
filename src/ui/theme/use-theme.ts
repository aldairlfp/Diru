import { darkColors, lightColors, type Palette } from "@/ui/theme/colors";
import { useColorScheme } from "react-native";

export function useTheme(): {
  colors: Palette;
  isDarkMode: boolean;
} {
  const isDarkMode = useColorScheme() === "dark";
  const colors = isDarkMode ? darkColors : lightColors;

  return { colors, isDarkMode };
}
