import appTheme from "@/theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { PropsWithChildren } from "react";

export default function AppThemeLayout(props: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  )
}
