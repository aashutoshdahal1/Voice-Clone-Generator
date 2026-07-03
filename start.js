module.exports = {
  daemon: true,
  run: [
    // Free up ports from any previous run
    {
      method: "shell.run",
      params: {
        message: "lsof -ti:8000 | xargs kill -9 2>/dev/null; lsof -ti:3000 | xargs kill -9 2>/dev/null; echo 'ports cleared'"
      }
    },

    // Start backend as a named persistent process
    {
      method: "shell.start",
      params: {
        id: "backend",
        path: "pocket-tts",
        message: "source $HOME/.local/bin/env && uv run pocket-tts serve --host localhost --port 8000",
        on: [{
          event: "/Application startup complete/",
          done: true
        }]
      }
    },

    // Start frontend as a named persistent process
    {
      method: "shell.start",
      params: {
        id: "frontend",
        path: "frontend",
        message: "npm run dev",
        on: [{
          event: "/Local:.*localhost:3000/",
          done: true
        }]
      }
    },

    // Register the URL for the Open Studio button
    {
      method: "local.set",
      params: {
        url: "http://localhost:3000"
      }
    }
  ]
}
