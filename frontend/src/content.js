// All visible copy lives here. Components import it; they hold no sentences of their own.

export const LIMITS = {
  maxFiles: 1000,
  maxBytes: 200 * 1024 * 1024,
};

export const NAV = {
  upload: "Upload",
  download: "Download",
};

export const UPLOAD = {
  title: "Upload Your Files",
  sub: "Securely share files or whole folders with a simple key.",
  caption: "No login · up to 1000 files · 200 MB · deleted after 5 minutes",
  pick: { mobile: "Add files from your phone", desktop: "Drag and drop files and folders here" },
  chooseFiles: "Choose files",
  chooseFolder: "Choose folder",
  reading: "Reading folder…",
  scanLabel: "Scan to open on your phone",
  keyLabel: "Download Key",
  retention: "Files are stored securely for 5 minutes only.",
  successMessage: "Files uploaded successfully! Share this key to download.",
  zippedMessage: "Uploaded as one ZIP. Share this key to download.",
  tooManyFiles: "You can only upload a maximum of 1000 files at once.",
  tooBig: "Total file size exceeds the 200MB limit.",
};

export const DOWNLOAD = {
  titleIdle: "Secure File Download",
  titleReady: "Your Download is Ready",
  subExpired: "This link has expired and files have been deleted.",
  subReady: "Your ZIP is ready to download.",
  subIdle: "Enter the key to securely fetch your files.",
  inputLabel: "Enter your download key",
};

export const HOME_SCREEN = {
  title: "Add AirBeam to your home screen",
  ios: "Tap Share, then Add to Home Screen.",
  android: "Tap the menu (three dots), then Add to Home screen or Install app.",
  generic: "Open your browser menu and choose Add to Home screen.",
  dismiss: "Dismiss",
};

export const WHY = {
  title: "Why Choose AirBeam?",
  intro:
    "AirBeam is designed for zero-friction file exchange across devices. Perfect for developers, mobile users, and privacy-conscious sharers.",
};

export const FEATURES = [
  {
    title: "Fast File Sharing",
    description:
      "Experience lightning-fast uploads and downloads with no registration required.",
  },
  {
    title: "Secure & Private",
    description:
      "Your files are encrypted and shared via a unique secure key for maximum privacy.",
  },
  {
    title: "Ephemeral Storage",
    description:
      "Files are automatically deleted after 5 minutes, ensuring your data doesn't linger.",
  },
  {
    title: "Mobile Friendly",
    description:
      "Use our built-in QR code generator to instantly transfer files to your mobile device.",
  },
  {
    title: "No-Login Transfer",
    description:
      "Send large files anonymously. No email or tracking—just pure file sharing.",
  },
  {
    title: "200MB Limit",
    description:
      "Upload up to 1000 files or whole folders in a single batch with a 200MB aggregate size limit.",
  },
];

export const FOOTER = {
  tagline: "Simple and secure no-login file sharing with AirBeam.",
  copyright: "© 2026 Developed by M. Muzammil. All rights reserved.",
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/muhammad-muzammil-8771a4309/",
    },
    { label: "GitHub", href: "https://github.com/muzammil-shayk" },
    { label: "Portfolio", href: "https://m-muzammil.dev" },
  ],
};
