from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
import pandas as pd
import math


app = FastAPI(default_response_class=ORJSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


df = pd.DataFrame()
processed_events: list[dict] = []


def load_and_process_csv():
    global df, processed_events

    try:
        df = pd.read_csv("public/cyberattacks.csv")
        df = df.fillna("")
        print(f"CSV loaded successfully, rows: {len(df)}")
    except Exception as e:
        print("CSV Load Error:", e)
        return

    if "Confidence Score" in df.columns:
        df["Confidence Score"] = pd.to_numeric(
            df["Confidence Score"], errors="coerce"
        ).fillna(0)
    else:
        df["Confidence Score"] = 0

    processed_events.clear()

    for r in df.itertuples(index=False):
        try:
            conf = float(getattr(r, "Confidence Score", 0))
            if math.isnan(conf) or math.isinf(conf):
                conf = 0.0
        except:
            conf = 0.0

        processed_events.append({
            "Country": (
                getattr(r, "Destination Country", "") or
                getattr(r, "Source Country", "") or
                getattr(r, "Country", "")
            ),
            "AttackType": getattr(r, "Attack Type", ""),
            "AffectedSystem": getattr(r, "Affected System", ""),
            "Protocol": getattr(r, "Protocol", ""),
            "SourceIP": getattr(r, "Source IP", ""),
            "detection": getattr(r, "Detection Label", ""),
            "confidence": conf
        })

    print(f"Processed {len(processed_events)} attack records")


@app.on_event("startup")
def startup_event():
    load_and_process_csv()

@app.get("/api/attacks")
def get_attacks(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Returns paginated cyber attack data
    """
    if not processed_events:
        return {"error": "CSV is empty or not loaded"}

    return {
        "total": len(processed_events),
        "limit": limit,
        "offset": offset,
        "data": processed_events[offset : offset + limit]
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "rows_loaded": len(processed_events)
    }

