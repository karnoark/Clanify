/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    primary: "rgb(168, 112, 78)",
    onPrimary: "rgb(255, 255, 255)",
    primaryContainer: "rgb(255, 219, 205)",
    onPrimaryContainer: "rgb(54, 15, 0)",
    secondary: "rgb(119, 87, 74)",
    onSecondary: "rgb(255, 255, 255)",
    secondaryContainer: "rgb(255, 219, 205)",
    onSecondaryContainer: "rgb(44, 22, 12)",
    tertiary: "rgb(103, 95, 48)",
    onTertiary: "rgb(255, 255, 255)",
    tertiaryContainer: "rgb(239, 227, 169)",
    onTertiaryContainer: "rgb(32, 28, 0)",
    error: "rgb(186, 26, 26)",
    onError: "rgb(255, 255, 255)",
    errorContainer: "rgb(255, 218, 214)",
    onErrorContainer: "rgb(65, 0, 2)",
    background: "rgb(219, 197, 174)",
    onBackground: "rgb(153, 70, 28)",
    surface: "rgb(255, 251, 255)",
    onSurface: "rgb(32, 26, 24)",
    surfaceVariant: "rgb(245, 222, 213)",
    onSurfaceVariant: "rgb(83, 68, 61)",
    outline: "rgb(133, 115, 108)",
    outlineVariant: "rgb(216, 194, 186)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(54, 47, 44)",
    inverseOnSurface: "rgb(251, 238, 234)",
    inversePrimary: "rgb(255, 181, 150)",
    elevation: {
      level0: "transparent",
      level1: "rgb(250, 242, 244)",
      level2: "rgb(247, 237, 237)",
      level3: "rgb(244, 231, 230)",
      level4: "rgb(243, 229, 228)",
      level5: "rgb(241, 226, 223)",
    },
    surfaceDisabled: "rgba(168, 112, 78, 0.5)",
    onSurfaceDisabled: "rgba(255, 255, 255, 0.38)",
    backdrop: "rgba(59, 45, 40, 0.4)",
    backgroundContainer: "rgb(255, 221, 183)",
    onBackgroundContainer: "rgb(42, 23, 0)",
  },
  dark: {
    primary: "rgb(255, 177, 194)",
    onPrimary: "rgb(102, 0, 43)",
    primaryContainer: "rgb(143, 0, 63)",
    onPrimaryContainer: "rgb(255, 217, 223)",
    secondary: "rgb(235, 178, 255)",
    onSecondary: "rgb(82, 0, 113)",
    secondaryContainer: "rgb(114, 17, 153)",
    onSecondaryContainer: "rgb(248, 216, 255)",
    tertiary: "rgb(236, 190, 145)",
    onTertiary: "rgb(70, 42, 9)",
    tertiaryContainer: "rgb(96, 64, 29)",
    onTertiaryContainer: "rgb(255, 220, 189)",
    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(32, 26, 27)",
    onBackground: "rgb(253, 53, 109)",
    surface: "rgb(32, 26, 27)",
    onSurface: "rgb(236, 224, 224)",
    surfaceVariant: "rgb(82, 67, 70)",
    onSurfaceVariant: "rgba(236, 224, 224, 0.7)",
    outline: "rgb(158, 140, 143)",
    outlineVariant: "rgb(82, 67, 70)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(236, 224, 224)",
    inverseOnSurface: "rgb(53, 47, 48)",
    inversePrimary: "rgb(185, 12, 85)",
    elevation: {
      level0: "transparent",
      level1: "rgb(43, 34, 35)",
      level2: "rgb(50, 38, 40)",
      level3: "rgb(57, 43, 45)",
      level4: "rgb(59, 44, 47)",
      level5: "rgb(63, 47, 50)",
    },
    surfaceDisabled: "rgba(255, 177, 194, 0.5)",
    onSurfaceDisabled: "rgba(102, 0, 43, 0.38)",
    backdrop: "rgba(58, 45, 47, 0.4)",
  },
};

//following are colors used till now
/*
primary: #FD356D 
placeholder of primary : #f5a9b2
dim placeholder of primary: rgba(245, 169, 178, 0.7)
dim_white: rgba(255, 255, 255, 0.7)",
borderColor: "rgba(253, 53, 109, 0.5)",
disabled_backgroundColor: "rgba(161, 34, 69, 0.7)"
enabled_backgroundColor: "rgba(207, 43, 89, 0.9)",
*/

/* 
Here’s the **dark theme palette** with RGB values for each color role, centered around your brand identity color **#FD356D**.

---

### 1. **Primary Colors**
- **Primary**: `rgb(253, 53, 109)`  
  (Your brand color, used for primary actions like buttons and highlights.)  

- **On Primary**: `rgb(255, 255, 255)`  
  (Text/icons on primary-colored surfaces.)  

- **Primary Container**: `rgb(94, 0, 29)`  
  (A darker variant of your brand color for containers and elevated surfaces.)  

- **On Primary Container**: `rgb(255, 217, 223)`  
  (Text/icons for containers.)  

---

### 2. **Secondary Colors**
- **Secondary**: `rgb(255, 167, 107)`  
  (A warm orange to complement your primary color, for secondary actions.)  

- **On Secondary**: `rgb(52, 18, 0)`  
  (Text/icons on secondary-colored surfaces.)  

- **Secondary Container**: `rgb(91, 26, 0)`  
  (A darker orange for containers.)  

- **On Secondary Container**: `rgb(255, 220, 198)`  
  (Text/icons for secondary containers.)  

---

### 3. **Tertiary Colors**
- **Tertiary**: `rgb(107, 147, 255)`  
  (A calming blue for accents or decorative purposes.)  

- **On Tertiary**: `rgb(0, 25, 68)`  
  (Text/icons on tertiary-colored surfaces.)  

- **Tertiary Container**: `rgb(0, 49, 106)`  
  (A darker blue for tertiary containers.)  

- **On Tertiary Container**: `rgb(217, 226, 255)`  
  (Text/icons for tertiary containers.)  

---

### 4. **Error Colors**
- **Error**: `rgb(255, 107, 107)`  
  (Bright red for errors or warnings like validation feedback.)  

- **On Error**: `rgb(255, 255, 255)`  
  (Text/icons on error surfaces.)  

- **Error Container**: `rgb(92, 0, 0)`  
  (Dark red for error containers.)  

- **On Error Container**: `rgb(255, 218, 214)`  
  (Text/icons for error containers.)  

---

### 5. **Neutral Colors**
- **Background**: `rgb(18, 18, 18)`  
  (Dark background for the app.)  

- **On Background**: `rgb(229, 229, 229)`  
  (Text/icons on the background.)  

- **Surface**: `rgb(30, 30, 30)`  
  (Dark gray for surfaces like cards or modals.)  

- **On Surface**: `rgb(229, 229, 229)`  
  (Text/icons on surfaces.)  

- **Surface Variant**: `rgb(58, 58, 58)`  
  (Slightly lighter gray for layered surfaces.)  

- **On Surface Variant**: `rgb(218, 218, 218)`  
  (Text/icons on surface variants.)  

---

### 6. **Other Roles**
- **Outline**: `rgb(117, 117, 117)`  
  (Borders or outlines.)  

- **Outline Variant**: `rgb(92, 92, 92)`  
  (Darker outlines for emphasis.)  

- **Shadow**: `rgb(0, 0, 0)`  
  (Shadows for elevation effects.)  

- **Scrim**: `rgba(0, 0, 0, 0.4)`  
  (For modals or overlays.)  

- **Inverse Surface**: `rgb(229, 229, 229)`  
  (Light surface for pop-ups in the dark theme.)  

- **Inverse On Surface**: `rgb(30, 30, 30)`  
  (Dark text/icons on inverse surfaces.)  

- **Backdrop**: `rgba(18, 18, 18, 0.7)`  
  (Dimmed effect for backdrops.)  

---

### 7. **Elevations**
For Material Design elevation levels:  

- **Level 0**: `rgb(18, 18, 18)` (transparent for the lowest elevation).  
- **Level 1**: `rgb(30, 30, 30)` (e.g., cards).  
- **Level 2**: `rgb(35, 35, 35)` (e.g., dropdowns).  
- **Level 3**: `rgb(39, 39, 39)` (e.g., modals).  
- **Level 4**: `rgb(44, 44, 44)` (e.g., floating buttons).  
- **Level 5**: `rgb(48, 48, 48)` (highest elevation).  

---

### Harmonious & Calming Use Case
1. **Buttons**:  
   - Use **Primary** and **On Primary** for action buttons.  
   - Use **Secondary** and **On Secondary** for less important actions.  

2. **Backgrounds**:  
   - Pair **Background** with **On Background** for text-heavy screens.  

3. **Cards & Modals**:  
   - Use **Surface** and **On Surface** for containers.  

4. **Errors**:  
   - Use **Error** sparingly for validation. Pair with **On Error** text.  

5. **Typography**:  
   - Ensure text colors align with the contrast of surfaces for readability.  

---

This **RGB palette** ensures your brand identity color (#FD356D) is central while offering harmonious support from secondary, tertiary, and neutral tones. Let me know if you’d like to refine or tweak anything!




*/
