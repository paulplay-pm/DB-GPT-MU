# Reports All Conversation Types - Tasks

## 1. 前端改动

- [x] 1.1 移除 API 调用中的 `chat_mode` 过滤参数

**规范校验清单：**
- [x] `getDialogueListPaged` 调用不再传递 `chat_mode` 字段
- [x] 不传 `chat_mode` 时后端返回所有类型会话

**安全校验清单：**
- [x] 用户只能看到自己创建的会话（后端 `user_name` 控制）

---

- [x] 1.2 修改 `router.push` 路由逻辑，改为 `/chat?scene=${chat_mode}&id=${convUid}`

**规范校验清单：**
- [x] `chat_mode = 'chat_react_agent'` 跳转到 `/chat?scene=chat_react_agent&id=${convUid}`
- [x] `chat_mode = 'chat_excel'` 跳转到 `/chat?scene=chat_excel&id=${convUid}`
- [x] `title` 参数正确传递并 URL 编码
- [x] query string 参数顺序为 `scene`、`id`、`title`

---

- [x] 1.3 确认 `gmt_created` 字段已在列表项中渲染

**规范校验清单：**
- [x] 创建时间显示格式为 `YYYY-MM-DD HH:mm`
- [x] 字段存在性校验（`gmt_created` 为空时不显示）

**安全校验清单：**
- [x] `gmt_created` 为只读字段，前端不发送修改请求

---

## 2. 验证测试

- [ ] 2.1 手动验证：报告页 → 会话记录标签 → 列表同时显示普通会话和应用会话

- [ ] 2.2 手动验证：点击普通会话（`chat_react_agent`）→ 跳转至 `/chat?scene=chat_react_agent&id=...` → 历史消息正确加载

- [ ] 2.3 手动验证：点击应用会话（`chat_excel`）→ 跳转至 `/chat?scene=chat_excel&id=...` → 应用专属 UI 正确渲染（如 Excel 上传组件）

- [ ] 2.4 手动验证：置顶/取消置顶、重命名、删除操作正常

- [ ] 2.5 手动验证：搜索、分页功能正常
