from .db import get_client
from .config import SUPABASE_BUCKET


def upload(path: str, data: bytes, content_type: str) -> None:
    get_client().storage.from_(SUPABASE_BUCKET).upload(
        path, data, {"content-type": content_type, "upsert": "false"}
    )


def signed_url(path: str, expires: int = 60) -> str:
    resp = get_client().storage.from_(SUPABASE_BUCKET).create_signed_url(path, expires)
    return resp["signedURL"]


def remove(paths: list[str]) -> None:
    get_client().storage.from_(SUPABASE_BUCKET).remove(paths)
