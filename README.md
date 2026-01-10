# SMS4Dev

<div align="center">
  <img src="preview01.png" alt="SMS4Dev Preview" width="800" />
</div>

<br />

<div align="center">

English | [中文](README_zh-CN.md)

</div>

<br />

**SMS4Dev** is a developer-friendly tool designed to simulate and test SMS functionalities. It provides a comprehensive interface for managing messages, templates, and signatures, along with real-time logging capabilities, making it an essential utility for developers working with SMS integrations.

### Key Features

- **📨 SMS Simulation**: Simulate sending and receiving SMS messages without real-world costs.
- **📊 Message History**: Automatically save and retrieve message history using a built-in SQLite database.
- **📝 Templates & Signatures**: Create, edit, and manage SMS templates and signatures for standardized testing.
- **🔍 API Logs**: Monitor API requests and responses in real-time to debug integrations effectively.
- **⚡ Real-time Updates**: Built with Socket.io to provide instant UI updates upon message events.
- **🐳 Docker Ready**: Fully containerized and ready for deployment via Docker Hub.

### Quick Start with Docker

The application is published on Docker Hub. You can pull and run it with a single command:

**Docker Hub**
```bash
docker run -d -p 5081:5081 boyce6280/sms4dev
```

**Aliyun ACR (China Mirror)**
If you are in China, you can use the Aliyun mirror for faster download:
```bash
docker run -d -p 5081:5081 crpi-24eqfvp93x6tspe9.cn-shenzhen.personal.cr.aliyuncs.com/boyce6280/sms4dev
```

Once the container is running, open your browser and navigate to:
[http://localhost:5081](http://localhost:5081)

### Local Development

If you prefer to run the code locally or contribute to the project:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/jd7438716/SMS4Dev.git
    cd sms4dev
    ```

2.  **Install dependencies**:
    ```bash
    # Install frontend dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    ```

3.  **Run the application**:
    
    You have several options:

    **Option A: One-click Development Environment (Recommended)**
    ```bash
    npm run dev:full
    ```
    This will start both the backend (5081) and frontend (3000) concurrently.

    **Option B: Production Preview**
    ```bash
    npm start
    ```
    This will build the frontend and serve it through the backend on port 5081 (similar to Docker mode).

    **Option C: Manual Start (Separate Terminals)**
    If you prefer to control them separately:

    **Terminal 1 (Backend):**
    ```bash
    npm run server
    ```

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```
    The frontend will start on http://localhost:3000.

### License

This project is released under the [MIT License](LICENSE).
