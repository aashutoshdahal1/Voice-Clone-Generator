module.exports = {
  version: "3.7",
  title: "Pocket TTS Studio",
  description: "Professional text-to-speech with voice cloning — powered by Kyutai Pocket TTS",
  icon: "icon.png",
  menu: async (kernel, info) => {
    const installed = info.exists("frontend/node_modules") && info.exists("pocket-tts/.venv")
    const running = info.running("start.js")
    const installing = info.running("install.js")

    if (installing) {
      return [{
        default: true,
        icon: "fa-solid fa-spinner",
        text: "Installing…",
        href: "install.js",
      }]
    }

    if (!installed) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
      }]
    }

    if (running) {
      const local = info.local("start.js")
      return [{
        default: true,
        icon: "fa-solid fa-rocket",
        text: "Open Studio",
        href: (local && local.url) ? local.url : "http://localhost:3000",
      }, {
        icon: "fa-solid fa-terminal",
        text: "Logs",
        href: "start.js",
      }, {
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
      }]
    }

    return [{
      default: true,
      icon: "fa-solid fa-power-off",
      text: "Start",
      href: "start.js",
    }, {
      icon: "fa-solid fa-plug",
      text: "Install",
      href: "install.js",
    }]
  }
}
