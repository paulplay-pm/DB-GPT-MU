## Overview

This change removes the ChatSider component from the chat detail page.

## No New Capabilities

This change does not introduce new capabilities or modify existing specification requirements. It is a UI simplification that:

- Removes the ChatSider component from the `/chat` page
- Preserves all existing application conversation functionality
- Does not change any API contracts or data models

## Files Affected

- `web/pages/chat/index.tsx` — Remove ChatSider rendering
- `web/new-components/chat/sider/ChatSider.tsx` — Component preserved (not deleted, not referenced elsewhere)