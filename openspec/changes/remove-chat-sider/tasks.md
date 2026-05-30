## 1. 修改 Chat 页面

- [x] 1.1 从 `web/pages/chat/index.tsx` 移除 `<ChatSider />` 组件引用
- [x] 1.2 移除 `dialogueList`、`refreshDialogList`、`listLoading` 等与 ChatSider 相关的状态
- [x] 1.3 移除 `ChatSider` 的 import 语句
- [x] 1.4 验证页面构建无错误 (`npm run build`)

## 2. 验证测试

- [x] 2.1 验证 chat_normal 对话正常对话
- [x] 2.2 验证 chat_excel 对话正常对话
- [x] 2.3 验证 chat_agent 对话正常对话
- [x] 2.4 验证 chat_knowledge 对话正常对话
- [x] 2.5 验证 chat_dashboard 对话正常对话
- [x] 2.6 验证从报告页进入历史应用对话正常加载
- [x] 2.7 验证新建对话后列表刷新正常

## 3. 代码清理（如需要）

- [x] 3.1 检查 `ChatSider` 组件是否被其他地方引用
- [x] 3.2 如无引用，可选择保留组件文件备选回滚