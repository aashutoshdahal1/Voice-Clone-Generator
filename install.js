module.exports = {
  run: [
    // 1. Install uv if missing
    {
      method: "shell.run",
      params: {
        message: [
          "curl -LsSf https://astral.sh/uv/install.sh | sh || true",
          "echo 'uv installed'"
        ]
      }
    },
    // 2. Add uv to PATH for this session
    {
      method: "shell.run",
      params: {
        message: "source $HOME/.local/bin/env && uv --version"
      }
    },
    // 3. Install pocket-tts Python env (downloads model weights too)
    {
      method: "shell.run",
      params: {
        path: "pocket-tts",
        message: [
          "source $HOME/.local/bin/env",
          "uv sync"
        ]
      }
    },
    // 4. Install frontend Node dependencies
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: "npm install"
      }
    },
    {
      method: "notify",
      params: {
        html: "<b>✅ Pocket TTS Studio installed!</b><br>Click <b>Start</b> to launch the app.",
        type: "success"
      }
    }
  ]
}
