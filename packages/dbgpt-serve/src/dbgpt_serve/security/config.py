from typing import Optional, List

SERVE_APP_NAME = "dbgpt_serve_security"
SERVE_APP_NAME_HUMP = "Security"
SERVE_CONFIG_KEY_PREFIX = "SECURITY"
SERVE_SERVICE_COMPONENT_NAME = "dbgpt_serve_security_service"


class ServeConfig:
    """Security service configuration"""

    def __init__(
        self,
        api_keys: Optional[List[str]] = None,
    ):
        self.api_keys = api_keys or []

    @classmethod
    def from_app_config(cls, config, prefix: str = SERVE_CONFIG_KEY_PREFIX):
        """Load config from app config"""
        api_keys = getattr(config, f"{prefix}_api_keys", None)
        return cls(api_keys=api_keys)