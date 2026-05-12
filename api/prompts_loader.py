"""Load and validate prompts.json for Cadillac demo."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Optional

from pydantic import BaseModel, Field, field_validator


class PromptEntry(BaseModel):
    id: str
    label: str
    text: str
    referral_paths: List[str] = Field(default_factory=list)
    logo_paths: List[str] = Field(default_factory=list)

    @field_validator("referral_paths")
    @classmethod
    def max_referrals(cls, v: List[str]) -> List[str]:
        if len(v) > 2:
            raise ValueError("At most 2 referral_paths supported")
        return v

    @field_validator("logo_paths")
    @classmethod
    def max_logos(cls, v: List[str]) -> List[str]:
        if len(v) > 3:
            raise ValueError("At most 3 logo_paths supported")
        return v


class PromptsFile(BaseModel):
    prompts: List[PromptEntry]


def load_prompts(path: Path) -> PromptsFile:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return PromptsFile.model_validate(raw)


def resolve_asset_path(base_dir: Path, rel: str) -> Path:
    p = (base_dir / rel).resolve()
    if not str(p).startswith(str(base_dir.resolve())):
        raise ValueError("Asset path escapes base directory")
    return p


def public_prompt_list(data: PromptsFile) -> List[dict[str, Any]]:
    """Strip sensitive prompt text for browser."""
    return [{"id": p.id, "label": p.label} for p in data.prompts]
