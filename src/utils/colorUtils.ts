export function isLightColor(hexColor: string): boolean {
    /**
     * Determine if a color is light (returns true) or dark (returns false)
     * based on its luminance value.
     */
    // Remove the '#' if present
    const hex = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255.0;
    const g = parseInt(hex.substr(2, 2), 16) / 255.0;
    const b = parseInt(hex.substr(4, 2), 16) / 255.0;
    
    // Calculate luminance using the standard formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Return true if light (luminance > 0.5), false if dark
    return luminance > 0.5;
}