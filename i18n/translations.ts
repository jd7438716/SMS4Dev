export type Language = 'en' | 'zh';

export const translations = {
  en: {
    nav: {
      inbox: "Inbox",
      logs: "API Logs",
      config: "Settings",
      docs: "Docs",
    },
    header: {
      port: "Port",
      clearAll: "Clear All",
      simulator: "Simulator",
      serverRunning: "Server Running"
    },
    inbox: {
      title: "Received Messages",
      searchPlaceholder: "Search number or body...",
      noMessages: "No messages found",
      to: "To",
    },
    detail: {
      title: "Message Details",
      selectPrompt: "Select a message to inspect",
      template: "Template",
      delete: "Delete Message",
      tabs: {
        preview: "Preview",
        raw: "Raw / Headers"
      },
      copyBody: "Copy Body Text",
      jsonRep: "JSON Representation",
      copy: "Copy",
      receivedAt: "Received At",
      from: "From",
      to: "To"
    },
    simulator: {
      title: "Simulator",
      rawTab: "Raw Text",
      apiTab: "API Mode",
      aiTab: "AI Gen",
      apiDesc: "Simulates calling the cloud API (Outbound). Generates an API Log and an Outbound Message.",
      manualDesc: "Injects raw text directly into the inbox (Inbound). Useful for testing receiving logic.",
      aiDesc: "Uses Gemini AI to dream up realistic SMS traffic patterns for bulk testing.",
      toPhone: "To Phone Number",
      fromNumber: "From Number",
      signature: "Signature",
      selectSignature: "Select Signature...",
      template: "Template",
      selectTemplate: "Select Template...",
      templateParams: "Template Params",
      simulateError: "Simulate API Error (e.g. Rate Limit)",
      sendApi: "Send via API",
      msgBody: "Message Body",
      injectInbound: "Inject Inbound SMS",
      generate: "Generate Random Traffic",
      generating: "Generating...",
      footer: "Mock Server Listening on Port 2525"
    },
    logs: {
      title: "API Logs",
      subtitle: "History of HTTP requests made to the mock server.",
      requests: "Requests",
      timestamp: "Timestamp",
      status: "Status",
      method: "Method",
      endpoint: "Endpoint",
      latency: "Latency",
      reqId: "Request ID",
      reqBody: "Request Body",
      resBody: "Response Body",
      noLogs: "No API requests recorded yet. Use the Simulator 'API Mode' to test."
    },
    config: {
      title: "Service Configuration",
      subtitle: "Manage your cloud SMS settings, signatures, templates, and webhooks.",
      tabs: {
        api: "API Credentials",
        signatures: "Signatures",
        templates: "Templates",
        webhooks: "Webhooks"
      },
      api: {
        accessKeys: "Access Keys",
        desc: "Use these keys to authenticate your API requests.",
        regenerate: "Regenerate",
        keyId: "Access Key ID",
        secret: "Access Key Secret",
        devMode: "Development Mode",
        devModeDesc: "These credentials are for the local mock server only. Do not use them in production environments."
      },
      sig: {
        add: "Add Signature",
        placeholder: "e.g. MyCompany",
        text: "Signature Text",
        status: "Status",
        actions: "Actions",
        noSig: "No signatures configured"
      },
      tpl: {
        create: "Create Template",
        name: "Template Name",
        type: "Type",
        content: "Content Pattern",
        placeholderContent: "Your verification code is ${code}.",
        otp: "Authentication (OTP)",
        notif: "Notification",
        marketing: "Marketing",
        presets: "Presets",
        addDefaults: "Add Defaults",
        noTpl: "No templates defined"
      },
      webhooks: {
        title: "Delivery Status Callback",
        desc: "Configure a URL to receive HTTP POST requests when message status changes (e.g. Delivered, Failed).",
        enable: "Enable Webhook Callbacks",
        endpoint: "Endpoint URL",
        save: "Save Configuration",
        example: "Example Payload"
      }
    },
    docs: {
      title: "Integration Guide",
      subtitle: "How to connect your application to SMS4Dev.",
      note: "Note",
      noteDesc: "SMS4Dev intercepts all outgoing messages configured to use this endpoint. No actual SMS messages are sent.",
      step1: "1. Configuration",
      step1Desc: "Configure your application to point to the local mock server instead of the real SMS provider API.",
      step2: "2. Sending a Message",
      step2Desc: "Make a POST request to the /send endpoint.",
      step3: "3. Response",
      step3Desc: "A successful request will return a generic success response.",
      curl: "cURL Example",
      js: "JavaScript (Fetch) Example",
      powershell: "PowerShell Example"
    }
  },
  zh: {
    nav: {
      inbox: "收件箱",
      logs: "API 日志",
      config: "配置管理",
      docs: "开发文档",
    },
    header: {
      port: "端口",
      clearAll: "清空所有",
      simulator: "模拟器",
      serverRunning: "运行中"
    },
    inbox: {
      title: "已收消息",
      searchPlaceholder: "搜索号码或内容...",
      noMessages: "暂无消息",
      to: "发送至",
    },
    detail: {
      title: "消息详情",
      selectPrompt: "请选择一条消息查看详情",
      template: "模版",
      delete: "删除消息",
      tabs: {
        preview: "预览",
        raw: "原始数据 / Headers"
      },
      copyBody: "复制正文",
      jsonRep: "JSON 视图",
      copy: "复制",
      receivedAt: "接收时间",
      from: "发送方",
      to: "接收方"
    },
    simulator: {
      title: "发送模拟器",
      rawTab: "原始文本",
      apiTab: "API 模式",
      aiTab: "AI 生成",
      apiDesc: "模拟调用云 API (Outbound)。会生成一条 API 日志和一条发出状态的消息。",
      manualDesc: "直接向收件箱注入文本 (Inbound)。用于测试接收逻辑。",
      aiDesc: "使用 Gemini AI 生成逼真的批量短信数据。",
      toPhone: "接收号码",
      fromNumber: "发送号码",
      signature: "短信签名",
      selectSignature: "选择签名...",
      template: "短信模版",
      selectTemplate: "选择模版...",
      templateParams: "模版变量参数",
      simulateError: "模拟 API 错误 (如：限流/余额不足)",
      sendApi: "通过 API 发送",
      msgBody: "短信内容",
      injectInbound: "注入接收短信",
      generate: "生成随机数据",
      generating: "生成中...",
      footer: "Mock 服务器监听端口 2525"
    },
    logs: {
      title: "API 请求日志",
      subtitle: "记录所有发往 Mock 服务器的 HTTP 请求。",
      requests: "请求数",
      timestamp: "时间戳",
      status: "状态码",
      method: "方法",
      endpoint: "接口路径",
      latency: "耗时",
      reqId: "请求 ID",
      reqBody: "请求 Body",
      resBody: "响应 Body",
      noLogs: "暂无记录。请使用模拟器的“API 模式”进行测试。"
    },
    config: {
      title: "服务配置",
      subtitle: "管理云短信设置、签名、模版及回调。",
      tabs: {
        api: "API 凭证",
        signatures: "签名管理",
        templates: "模版管理",
        webhooks: "Webhook 回调"
      },
      api: {
        accessKeys: "Access Keys",
        desc: "用于 API 请求鉴权的密钥。",
        regenerate: "重新生成",
        keyId: "Access Key ID",
        secret: "Access Key Secret",
        devMode: "开发模式",
        devModeDesc: "这些凭证仅用于本地 Mock 服务器，请勿在生产环境使用。"
      },
      sig: {
        add: "添加签名",
        placeholder: "例如：我的公司",
        text: "签名内容",
        status: "状态",
        actions: "操作",
        noSig: "暂无配置签名"
      },
      tpl: {
        create: "创建模版",
        name: "模版名称",
        type: "类型",
        content: "模版内容",
        placeholderContent: "您的验证码是 ${code}，5分钟内有效。",
        otp: "验证码 (OTP)",
        notif: "通知短信",
        marketing: "营销短信",
        noTpl: "暂无定义模版",
        presets: "快速预设",
        usePreset: "填充",
        addDefaults: "批量添加默认模版"
      },
      webhooks: {
        title: "投递状态回调",
        desc: "配置 URL 以接收消息状态变更（如已送达、失败）的 HTTP POST 推送。",
        enable: "启用 Webhook 回调",
        endpoint: "回调 URL",
        save: "保存配置",
        example: "Payload 示例"
      }
    },
    docs: {
      title: "集成指南",
      subtitle: "如何将您的应用连接到 SMS4Dev。",
      note: "注意",
      noteDesc: "SMS4Dev 会拦截配置为使用此端点的所有发出消息。不会向运营商网络发送实际短信。",
      step1: "1. 配置",
      step1Desc: "将您的应用程序配置为指向本地 Mock 服务器，而不是真实的 SMS 提供商 API。",
      step2: "2. 发送消息",
      step2Desc: "向 /send 端点发送 POST 请求。",
      step3: "3. 响应",
      step3Desc: "成功请求将返回类似于主要提供商的通用成功响应。",
      curl: "cURL 示例",
      js: "JavaScript (Fetch) 示例",
      powershell: "PowerShell 示例"
    }
  }
};
