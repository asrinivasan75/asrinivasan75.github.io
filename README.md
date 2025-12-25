# Aadithya Srinivasan's Portfolio Website

A modern, Stripe-inspired portfolio website featuring a sleek blue/black color scheme, beautiful typography, and smooth animations. Built with HTML5, CSS3, JavaScript, and UIkit framework.

## 🚀 How to Run the Website

### Option 1: Local Development Server (Recommended)

Since this is a static website, you can run it using any local web server. Here are a few options:

#### Using Python (if installed):
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open your browser and navigate to: `http://localhost:8000`

#### Using Node.js (if installed):
```bash
# Install http-server globally (one-time)
npm install -g http-server

# Run the server
http-server -p 8000
```

Then open your browser and navigate to: `http://localhost:8000`

#### Using PHP (if installed):
```bash
php -S localhost:8000
```

### Option 2: Open Directly in Browser

You can also open `index.html` directly in your browser, though some features (like external API calls) may not work due to CORS restrictions.

### Option 3: GitHub Pages (Production)

Since this repository is named `asrinivasan75.github.io`, it's automatically set up for GitHub Pages:

1. Push your changes to the `main` branch
2. Go to your repository settings on GitHub
3. Navigate to "Pages" in the left sidebar
4. Select the `main` branch as the source
5. Your site will be live at: `https://asrinivasan75.github.io`

## 📁 Project Structure

```
asrinivasan75.github.io/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Custom styles (Stripe-inspired design)
│   └── uikit.css       # UIkit framework styles
├── js/
│   ├── scripts.js      # Custom JavaScript functionality
│   ├── uikit.js        # UIkit framework
│   └── uikit-icons.js  # UIkit icons
├── images/
│   └── profile.jpg     # Profile image
├── resume.pdf          # Resume file
└── README.md           # This file
```

## 🎨 Design Features

- **Modern Typography**: Uses Inter font family (similar to Stripe's design)
- **Color Scheme**: Cool blue/black theme with cyan and purple accents
- **Smooth Animations**: Fade-in effects, hover interactions, and 3D project carousel
- **Responsive Design**: Works beautifully on all device sizes
- **Interactive Elements**: Hover effects on cards, timeline, and buttons
- **Particle Background**: Animated particle system for visual interest

## ✏️ How to Add Content to the Website

### Adding a New Project

1. Open `index.html`
2. Find the `<!-- Projects Section -->` (around line 197)
3. Inside the `#projectsContainer` div, add a new project slide:

```html
<div class="project-slide">
  <div class="project-card">
    <h4>Your Project Name</h4>
    <p>Brief description of your project.</p>
    <ul>
      <li><strong>Technology:</strong> List technologies used</li>
      <li><strong>Features:</strong> Key features</li>
      <li><strong>Results:</strong> Achievements or outcomes</li>
    </ul>
    <a class="uk-button-text uk-text-decoration-none" href="https://github.com/yourusername/project">
      <span uk-icon="icon: link"></span> View on GitHub
    </a>
    <div class="project-expand-hint">Hover to see details</div>
  </div>
</div>
```

### Adding a New Experience Entry

1. Find the `<!-- Experience Timeline Section -->` (around line 71)
2. Inside the `.timeline-container` div, add a new timeline item:

```html
<div class="timeline-item">
  <div class="timeline-date">
    Start Date –<br>End Date
  </div>
  <div class="timeline-marker"></div>
  <div class="timeline-card">
    <div class="timeline-company">Company Name</div>
    <div class="timeline-role">Your Role</div>
    <div class="timeline-location">📍 Location</div>
    <ul class="timeline-responsibilities">
      <li>Responsibility or achievement 1</li>
      <li>Responsibility or achievement 2</li>
      <li>Responsibility or achievement 3</li>
    </ul>
    <div class="timeline-expand-hint">Hover to see details</div>
  </div>
</div>
```

### Adding a New Skill

1. Find the `<!-- Skills Section -->` (around line 140)
2. Add a new skill entry:

```html
<div class="skill">
    <h4>Skill Name</h4>
    <div class="skill-bar">
        <div class="skill-level" data-skill="85"></div>
    </div>
</div>
```

Change the `data-skill` value (0-100) to set the skill level percentage.

### Updating Personal Information

1. **Name and Title**: Edit the hero section (around line 37-42)
2. **About Me**: Update the content in the `#about` section (around line 48)
3. **Profile Image**: Replace `images/profile.jpg` with your own image
4. **Resume**: Replace `resume.pdf` with your updated resume

### Customizing Colors

The color scheme is defined in `css/styles.css` using CSS variables (around line 20):

```css
:root {
    --primary-blue: #0066FF;
    --cyan-accent: #00D9FF;
    --purple-accent: #7C3AED;
    /* ... more colors ... */
}
```

Change these values to customize the color scheme throughout the site.

### Changing Typed.js Animation Text

Find the Typed.js initialization (around line 482) and update the `strings` array:

```javascript
new Typed('#typed', {
  strings: ['Your Title 1', 'Your Title 2', 'Your Title 3'],
  // ... rest of config
});
```

## 🛠️ Technologies Used

- **HTML5**: Structure and content
- **CSS3**: Styling with modern features (gradients, animations, CSS variables)
- **JavaScript**: Interactive functionality
- **UIkit 3**: UI framework for components
- **Typed.js**: Animated typing effect
- **Particles.js**: Animated background particles

## 📝 Customization Tips

1. **Fonts**: The site uses Inter from Google Fonts. To change it, update the Google Fonts link in `index.html` and the `font-family` in `css/styles.css`

2. **Animations**: Adjust animation speeds and effects in `css/styles.css` by modifying `transition` and `animation` properties

3. **Spacing**: Modify padding and margins in the `section` styles in `css/styles.css`

4. **Particle Effects**: Customize the particle background by editing the `particlesJS` configuration in `index.html` (around line 420)

## 🔧 Troubleshooting

- **Fonts not loading?** Make sure you have an internet connection (Google Fonts loads from CDN)
- **Particles not showing?** Check browser console for JavaScript errors
- **Styles not applying?** Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- **GitHub Pages not updating?** Wait a few minutes after pushing, or check repository settings

## 📄 License

This is a personal portfolio website. Feel free to use it as inspiration for your own portfolio!

## 🤝 Contributing

This is a personal portfolio, but suggestions and feedback are always welcome!

---

**Live Site**: [https://asrinivasan75.github.io](https://asrinivasan75.github.io)

**Contact**: aadithya.srinivasan@gmail.com
