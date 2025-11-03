# Multi-Agent Writing Integration - Testing Guide

## 测试状态

✅ 开发服务器运行中: http://localhost:3000
✅ Multi-agent tool 已集成
✅ 所有代码编译无错误

## 快速测试步骤

### 1. 打开聊天界面

访问: http://localhost:3000

### 2. 登录/注册

确保你已登录（multi-agent API 需要认证）

### 3. 测试用例

尝试以下消息来触发 multi-agent writing tool：

#### 测试 1: 基础文章写作

```
写一篇关于户外运动健康益处的文章
```

**期望行为:**

- AI 识别这是内容创作请求
- 调用 `multiAgentWriting` tool
- 显示工具调用状态
- 10-30 秒后返回完整文章
- 文章应包含多个角色的视角（如健康专家、运动爱好者等）

#### 测试 2: 技术文档

```
Create a comprehensive technical guide about TypeScript for beginners
```

**期望行为:**

- Role Analyzer 应识别出技术专家、教育者等角色
- 返回结构化的技术文档
- 包含代码示例和清晰的解释

#### 测试 3: 营销内容

```
Draft a marketing campaign for a sustainable fashion brand targeting millennials
```

**期望行为:**

- 识别营销专家、内容策略师、品牌故事讲述者等角色
- 返回具有说服力和创意的营销内容

#### 测试 4: 学术写作

```
Write an academic analysis of remote work's impact on productivity
```

**期望行为:**

- 识别分析师、研究员、学术专家等角色
- 返回专业、有深度的学术风格内容

### 4. 验证要点

检查以下内容：

- [ ] **Tool 调用可见**: 聊天界面显示正在使用 multiAgentWriting tool
- [ ] **等待时间合理**: 大约 10-30 秒（并行执行）
- [ ] **内容质量**: 文章结构完整、内容连贯
- [ ] **多角色视角**: 内容体现了不同角色的贡献
- [ ] **元数据显示**: 可以看到哪些角色参与了创作（如果 UI 支持）
- [ ] **错误处理**: 如果失败，有友好的错误提示

### 5. 查看工具调用详情

在聊天界面中，你应该能看到：

```json
{
  "tool": "multiAgentWriting",
  "parameters": {
    "request": "写一篇关于户外运动健康益处的文章",
    "tone": "professional",
    ...
  }
}
```

以及返回结果：

```json
{
  "success": true,
  "content": "# 完整的文章内容...",
  "metadata": {
    "roles": "Health Expert, Sports Enthusiast, Content Strategist",
    "strategy": "interleaving",
    "duration": 15234,
    "agents": [...]
  }
}
```

## 高级测试

### 测试特定参数

如果 AI 支持，可以尝试更具体的请求：

```
Write a casual, 500-word article about coffee culture for general audiences
```

这应该设置：

- tone: "casual"
- maxLength: 500
- targetAudience: "general audiences"

### 测试不同合成策略

```
Write a technical article with each expert's contribution clearly highlighted
```

应该触发 `highlighting` 策略，让每个角色的贡献清晰可见。

## 调试

### 查看服务器日志

在终端查看：

- Role analysis 结果
- 每个 agent 的执行状态
- 任何错误或警告

### 常见问题

1. **Tool 没有被调用**

   - 检查请求是否明确是"写作"类型
   - 尝试更直接的表述："Write an article about..."

2. **超时错误**

   - 正常，单个 agent 有 30 秒超时
   - 检查网络连接和 API 响应

3. **认证错误 (401)**

   - 确保已登录
   - 检查 session 是否有效

4. **内容质量不佳**
   - 可能需要调整 role templates
   - 查看 role analyzer 是否选择了合适的角色

## 成功标准

✅ **基础功能**

- Tool 能被 AI 正确调用
- 返回完整的文章内容
- 无崩溃或致命错误

✅ **质量标准**

- 内容连贯、结构清晰
- 体现多角色视角
- 符合用户请求的主题和风格

✅ **性能标准**

- 30 秒内完成（大多数情况）
- 服务器资源占用合理

## 下一步

测试通过后，可以考虑：

1. **添加 UI 优化**

   - 显示正在工作的角色
   - 实时显示进度
   - 更好地展示元数据

2. **性能优化**

   - 实现 role analysis 缓存
   - 优化 prompt 减少 token 使用

3. **用户反馈**
   - 添加内容质量评分
   - 收集角色选择的准确性反馈

---

**开始测试！** 🚀

打开 http://localhost:3000 并尝试上面的测试用例。
