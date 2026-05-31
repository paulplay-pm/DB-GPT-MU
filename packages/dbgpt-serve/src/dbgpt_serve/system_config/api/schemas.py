"""API schemas for system config."""

from typing import Optional

from pydantic import BaseModel, Field


class BrandConfigResponse(BaseModel):
    """Brand configuration response."""

    logo_url: Optional[str] = Field(None, description="Logo URL")
    product_name_zh: str = Field(default="DB-GPT", description="Product name in Chinese")
    product_name_en: str = Field(default="DB-GPT", description="Product name in English")
    slogan: str = Field(default="开口问数，预见洞察", description="Product slogan in Chinese")
    slogan_en: str = Field(default="Ask Data, Find Insights", description="Product slogan in English")


class BrandConfigUpdateRequest(BaseModel):
    """Brand configuration update request."""

    logo_url: Optional[str] = Field(None, description="Logo URL")
    product_name_zh: Optional[str] = Field(None, description="Product name in Chinese")
    product_name_en: Optional[str] = Field(None, description="Product name in English")
    slogan: Optional[str] = Field(None, description="Product slogan in Chinese")
    slogan_en: Optional[str] = Field(None, description="Product slogan in English")