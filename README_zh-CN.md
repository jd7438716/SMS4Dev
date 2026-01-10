# SMS4Dev

<div align="center">
  <img src="preview01.png" alt="SMS4Dev Preview" width="800" />
</div>

<br />

<div align="center">

[English](README.md) | 中文

</div>

<br />

**SMS4Dev** 是一款专为开发者设计的短信模拟与测试工具。它提供了一个直观的界面来管理消息、模板和签名，并具备实时日志记录功能，是开发短信集成功能时的得力助手。

### 主要功能

- **📨 短信模拟**：模拟短信发送和接收流程，无需产生实际费用。
- **📊 消息历史**：内置 SQLite 数据库，自动保存和检索历史消息记录。
- **📝 模板与签名**：创建、编辑和管理短信模板与签名，方便进行标准化测试。
- **🔍 API 日志**：实时监控 API 请求和响应，帮助快速调试集成问题。
- **⚡ 实时更新**：基于 Socket.io 构建，确保界面能够即时响应消息事件。
- **🐳 Docker 支持**：已容器化并发布至 Docker Hub，可一键部署。

### Docker 快速开始

本项目镜像已发布到 Docker Hub 和阿里云镜像仓库。您可以通过以下命令快速启动：

**Docker Hub**
```bash
docker run -d -p 5081:5081 boyce6280/sms4dev
```

**阿里云 ACR (国内加速)**
国内用户推荐使用阿里云镜像源以获得更快的下载速度：
```bash
docker run -d -p 5081:5081 crpi-24eqfvp93x6tspe9.cn-shenzhen.personal.cr.aliyuncs.com/boyce6280/sms4dev
```

容器启动后，请在浏览器中访问：
[http://localhost:5081](http://localhost:5081)

### 本地开发

如果您希望在本地运行代码或参与开发：

1.  **克隆仓库**：
    ```bash
    git clone https://github.com/jd7438716/SMS4Dev.git
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
