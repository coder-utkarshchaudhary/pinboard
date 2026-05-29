from datetime import datetime, timedelta, timezone

PRIORITY_DAYS: dict[str, int] = {
    "very_low": 5,
    "low": 3,
    "medium": 2,
    "high": 1,
}

PRIORITY_RANK: dict[str, int] = {
    "very_low": 1,
    "low": 2,
    "medium": 3,
    "high": 4,
}


def due_from(created_at: datetime, priority: str) -> datetime:
    return created_at + timedelta(days=PRIORITY_DAYS[priority])
