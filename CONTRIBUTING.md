# 贡献指南

感谢您对 Chromatopoetry 项目的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果您发现了 bug 或有新的功能建议，请：

1. 检查 [Issues](https://github.com/your-username/chromatopoetry/issues) 是否已有相同的问题
2. 如果没有，创建一个新的 Issue，详细描述问题或建议

### 提交代码

1. **Fork 仓库**
   - 点击页面右上角的 Fork 按钮

2. **克隆您的仓库**
   ```bash
   git clone https://github.com/your-username/chromatopoetry.git
   cd chromatopoetry
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新相关文档

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加您的功能描述"
   ```

6. **推送到您的仓库**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 在 GitHub 上创建 Pull Request
   - 详细描述您的更改

## 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks
- 保持代码简洁和可读性

## 提交信息规范

使用语义化的提交信息：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更改
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 添加测试
- `chore`: 构建/工具链更新

示例：
```
feat: 添加火山引擎模型支持
fix: 修复图片上传后的显示问题
docs: 更新 README 部署说明
```

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 测试

在提交 Pull Request 之前，请确保：

- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 ESLint 检查
- [ ] 功能在本地正常运行
- [ ] 更新了相关文档

## 行为准则

- 尊重所有贡献者
- 保持友好和专业的交流
- 欢迎提出建设性的批评
- 避免使用冒犯性语言

## 许可证

通过提交代码，您同意您的贡献将按照项目的 MIT 许可证进行许可。
