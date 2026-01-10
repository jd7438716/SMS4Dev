# SMS4Dev

<div align="center">
  <img src="preview01.png" alt="SMS4Dev Preview" width="800" />
</div>

<br />

<div align="center">
  <a href="#english">English</a> | <a href="#chinese">中文</a>
</div>

<br />

<a name="english"></a>
## English

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

```bash
docker run -d -p 5081:5081 boyce6280/sms4dev
```

Once the container is running, open your browser and navigate to:
[http://localhost:5081](http://localhost:5081)

### Local Development

If you prefer to run the code locally or contribute to the project:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/sms4dev.git
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
    You need to run the backend and frontend in separate terminals.

    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm start
    ```
    The server will start on port 5081.

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```
    The frontend will start on http://localhost:3000.

### License

This project is released under the [MIT License](LICENSE).

---

<a name="chinese"></a>
## 中文 (Chinese)

**SMS4Dev** 是一款专为开发者设计的短信模拟与测试工具。它提供了一个直观的界面来管理消息、模板和签名，并具备实时日志记录功能，是开发短信集成功能时的得力助手。

### 主要功能

- **📨 短信模拟**：模拟短信发送和接收流程，无需产生实际费用。
- **📊 消息历史**：内置 SQLite 数据库，自动保存和检索历史消息记录。
- **📝 模板与签名**：创建、编辑和管理短信模板与签名，方便进行标准化测试。
- **🔍 API 日志**：实时监控 API 请求和响应，帮助快速调试集成问题。
- **⚡ 实时更新**：基于 Socket.io 构建，确保界面能够即时响应消息事件。
- **🐳 Docker 支持**：已容器化并发布至 Docker Hub，可一键部署。

### Docker 快速开始

本项目镜像已发布到 Docker Hub。您可以通过以下命令快速启动：

```bash
docker run -d -p 5081:5081 boyce6280/sms4dev
```

容器启动后，请在浏览器中访问：
[http://localhost:5081](http://localhost:5081)

### 本地开发

如果您希望在本地运行代码或参与开发：

1.  **克隆仓库**：
    ```bash
    git clone https://github.com/your-username/sms4dev.git
    cd sms4dev
    ```

2.  **安装依赖**：
    ```bash
    # 安装前端依赖
    npm install
    
    # 安装服务端依赖
    cd server
    npm install
    cd ..
    ```

3.  **运行应用**：
    
    您有两种选择：

    **选项 A：一键启动开发环境（推荐）**
    ```bash
    npm run dev:full
    ```
    这将同时启动后端 (5081) 和前端 (3000)。

    **选项 B：生产环境预览**
    ```bash
    npm start
    ```
    这将构建前端并通过后端在 5081 端口提供服务（类似 Docker 模式）。

    **选项 C：手动启动（独立终端）**
    如果您希望分别控制：

    **终端 1 (后端)**：
    ```bash
    npm run server
    ```

    **终端 2 (前端)**：
    ```bash
    npm run dev
    ```

### 许可证

本项目采用 [MIT 许可证](LICENSE) 进行授权。
