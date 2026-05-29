from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from .db import get_client
from .priority import PRIORITY_DAYS, PRIORITY_RANK, due_from
from .schemas import CardOut, CardUpdate
from . import storage as store

router = APIRouter(prefix="/api")


def _row_to_card(row: dict) -> CardOut:
    return CardOut(**row)


@router.get("/cards", response_model=List[CardOut])
def list_cards(status: str = "todo"):
    if status not in ("todo", "done"):
        raise HTTPException(400, "status must be 'todo' or 'done'")

    db = get_client()
    if status == "todo":
        resp = (
            db.table("cards")
            .select("*")
            .eq("status", "todo")
            .order("priority_rank", desc=True)
            .order("due_at", desc=False)
            .execute()
        )
    else:
        resp = (
            db.table("cards")
            .select("*")
            .eq("status", "done")
            .order("completed_at", desc=True)
            .execute()
        )
    return [_row_to_card(r) for r in resp.data]


@router.post("/cards", response_model=List[CardOut])
async def create_cards(
    text: Optional[str] = Form(None),
    priority: str = Form(...),
    files: List[UploadFile] = File(default=[]),
):
    if priority not in PRIORITY_DAYS:
        raise HTTPException(400, f"priority must be one of {list(PRIORITY_DAYS)}")

    text = (text or "").strip()
    if not text and not files:
        raise HTTPException(400, "Provide text, at least one file, or both")

    now = datetime.now(tz=timezone.utc)
    due = due_from(now, priority)
    rank = PRIORITY_RANK[priority]
    db = get_client()
    created: list[dict] = []

    if text:
        row = {
            "kind": "text",
            "content": text,
            "priority": priority,
            "priority_rank": rank,
            "status": "todo",
            "created_at": now.isoformat(),
            "due_at": due.isoformat(),
        }
        resp = db.table("cards").insert(row).execute()
        created.extend(resp.data)

    for upload in files:
        if not upload.filename:
            continue
        card_id = str(uuid.uuid4())
        file_bytes = await upload.read()
        file_path = f"{card_id}/{upload.filename}"
        try:
            store.upload(file_path, file_bytes, upload.content_type or "application/octet-stream")
        except Exception as exc:
            raise HTTPException(500, f"Storage upload failed: {exc}") from exc

        row = {
            "id": card_id,
            "kind": "file",
            "file_name": upload.filename,
            "file_path": file_path,
            "file_size": len(file_bytes),
            "mime_type": upload.content_type,
            "priority": priority,
            "priority_rank": rank,
            "status": "todo",
            "created_at": now.isoformat(),
            "due_at": due.isoformat(),
        }
        try:
            resp = db.table("cards").insert(row).execute()
            created.extend(resp.data)
        except Exception as exc:
            store.remove([file_path])
            raise HTTPException(500, f"DB insert failed: {exc}") from exc

    return [_row_to_card(r) for r in created]


@router.patch("/cards/{card_id}", response_model=CardOut)
def update_card(card_id: str, body: CardUpdate):
    db = get_client()
    existing = db.table("cards").select("*").eq("id", card_id).single().execute()
    if not existing.data:
        raise HTTPException(404, "Card not found")

    row = existing.data
    updates: dict = {}

    if body.content is not None:
        if row["kind"] != "text":
            raise HTTPException(400, "Cannot edit content of a file card")
        updates["content"] = body.content.strip()

    if body.priority is not None:
        if body.priority not in PRIORITY_DAYS:
            raise HTTPException(400, f"priority must be one of {list(PRIORITY_DAYS)}")
        created_at = datetime.fromisoformat(row["created_at"])
        updates["priority"] = body.priority
        updates["priority_rank"] = PRIORITY_RANK[body.priority]
        updates["due_at"] = due_from(created_at, body.priority).isoformat()

    if body.status is not None:
        updates["status"] = body.status
        if body.status == "done":
            updates["completed_at"] = datetime.now(tz=timezone.utc).isoformat()
        else:
            updates["completed_at"] = None

    if not updates:
        return _row_to_card(row)

    resp = db.table("cards").update(updates).eq("id", card_id).execute()
    return _row_to_card(resp.data[0])


@router.delete("/cards/{card_id}")
def delete_card(card_id: str):
    db = get_client()
    existing = db.table("cards").select("*").eq("id", card_id).single().execute()
    if not existing.data:
        raise HTTPException(404, "Card not found")

    row = existing.data
    if row["kind"] == "file" and row.get("file_path"):
        store.remove([row["file_path"]])

    db.table("cards").delete().eq("id", card_id).execute()
    return JSONResponse({"ok": True})


@router.get("/cards/{card_id}/download")
def download_card(card_id: str):
    db = get_client()
    existing = db.table("cards").select("*").eq("id", card_id).single().execute()
    if not existing.data:
        raise HTTPException(404, "Card not found")

    row = existing.data
    if row["kind"] != "file" or not row.get("file_path"):
        raise HTTPException(400, "Not a file card")

    url = store.signed_url(row["file_path"], expires=120)
    return {"url": url}

app = FastAPI(title="Pinboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)