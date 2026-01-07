# Hero Section CSS Adjustments

You can fine-tune the hero section layout by adjusting these CSS properties in `styles.css`:

## Key CSS Attributes to Adjust

### 1. **Image Size**
```css
.floating-person {
  max-width: 700px;  /* Change this value (500px - 900px) */
}
```
- **Smaller value** = smaller image
- **Larger value** = bigger image

### 2. **Text Position (Overlap)**
```css
.hero-text {
  margin-top: -80px;  /* Change this value (-150px to 0px) */
}
```
- **More negative** (e.g., `-120px`) = text moves up, more overlap
- **Less negative** (e.g., `-40px`) = text moves down, less overlap
- **Zero** (`0px`) = no overlap

### 3. **Image Vertical Position**
```css
.hero-content {
  padding-top: var(--space-2xl);  /* Adjust spacing */
}
```
- Change to `padding-top: 0;` to move image higher
- Change to `padding-top: var(--space-3xl);` to move image lower

### 4. **Overall Hero Height**
```css
.hero-content {
  min-height: calc(100vh - 80px);  /* Adjust viewport height */
}
```
- Change `100vh` to `90vh` for shorter section
- Change `100vh` to `100vh` to fill entire viewport

## Current Settings
- Image max-width: `700px`
- Text overlap: `-80px` (moves text up into image)
- Image position: Centered with `padding-top: var(--space-2xl)`
